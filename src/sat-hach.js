/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.1 — MÀN SÁT HẠCH

   Ba loại bài trong cùng một máy chấm:
     · Năm tầng năng lực B1–B5 cho từng vai
     · Bốn bài tốt nghiệp cuối chu kỳ 7 · 21 · 90 · 365 ngày
     · Bài định kỳ, hạn theo vai

   Nguyên tắc đã đặt trong kho: bài kiểm tra KHÔNG dùng để loại người. Nó
   trả lời đúng một câu — người này đang ở cấp độ nào và cần học gì tiếp.
   Nên kết quả luôn đi kèm khoá học được mở ra, không đi kèm lời phán.

   Đề bốc ngẫu nhiên nhưng ỔN ĐỊNH trong một lượt thi: hạt bốc gắn với
   lần thi, không gắn với lần vẽ lại màn. Không thì mỗi lần bấm một đáp
   án là đề đổi, và không ai làm xong nổi một bài.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

/* ─── Kho riêng ─── */
function kq(){
  if(!G.S) return {};
  if(!G.S.sathach || typeof G.S.sathach !== 'object') G.S.sathach = {};
  return G.S.sathach;
}
function ghi(k, v){
  if(!G.S || !G.S.acc) return;
  kq()[k] = v;
  if(G.danhDau) G.danhDau('sathach', k);
  if(G.save) G.save();
}

/* ─── Vai sát hạch của người đang đăng nhập ─── */
G.shVaiCuaToi = function(){
  var r = G.S && G.S.roleObj;
  if(!r) return 'PH';
  var ds = G.SH_VAI || [];
  for(var i = 0; i < ds.length; i++)
    if((ds[i].vaiId || []).indexOf(r.id) >= 0) return ds[i].ma;
  return r.lv <= 4 ? 'COACH' : 'PH';        /* quản trị thi bộ của Coach */
};
function vaiObj(ma){
  return (G.SH_VAI || []).filter(function(x){ return x.ma === ma; })[0] || {ma:ma, ten:ma, dat:70, c:'var(--gita)'};
}
function tangObj(ma){
  return (G.SH_TANG || []).filter(function(x){ return x.ma === ma; })[0] || null;
}
function trucObj(ma){
  return (G.SH_TRUC || []).filter(function(x){ return x.ma === ma; })[0] ||
         {ma:ma, ten:ma, c:'var(--gita)', ic:'target', y:''};
}

/* ─── Bốc đề ổn định theo hạt ─── */
function bam(s){
  var n = 2166136261;
  s = String(s);
  for(var i = 0; i < s.length; i++){ n ^= s.charCodeAt(i); n = Math.imul(n, 16777619); }
  return n >>> 0;
}
function tron(ds, hat){
  var a = ds.slice(), n = hat >>> 0;
  for(var i = a.length - 1; i > 0; i--){
    n = (Math.imul(n, 1103515245) + 12345) >>> 0;
    var j = n % (i + 1);
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

G.shKhoCua = function(vai, tang){
  return (G.SH_HOI || []).filter(function(x){
    return x.vai === vai && (!tang || x.tang === tang);
  });
};

/* Đề của một lượt thi. maBai: 'B1'…'B5' hoặc 'TN07'…'TN365' */
G.shDe = function(maBai, hat){
  var vai = G.shVaiCuaToi();
  var t = tangObj(maBai);
  if(t) return tron(G.shKhoCua(vai, maBai), hat).slice(0, t.cau);

  var tn = (G.SH_TOTNGHIEP || []).filter(function(x){ return x.ma === maBai; })[0];
  if(!tn) return [];
  /* Bài tốt nghiệp rút từ mọi tầng, nhưng chỉ những trục mốc ấy đo */
  var kho = G.shKhoCua(vai).filter(function(x){ return tn.truc.indexOf(x.truc) >= 0; });
  return tron(kho, hat).slice(0, tn.cau);
};

function baiObj(maBai){
  return tangObj(maBai) || (G.SH_TOTNGHIEP || []).filter(function(x){ return x.ma === maBai; })[0] || null;
}

/* ─── Chấm ─── */
G.shCham = function(maBai, de, tl){
  var b = baiObj(maBai);
  var vai = G.shVaiCuaToi();
  var ts = (G.SH_TRONGSO || {})[vai] || {};
  var dung = 0, theoTruc = {};

  de.forEach(function(c, i){
    var ok = (tl[i] === c.d);
    if(ok) dung++;
    var t = theoTruc[c.truc] || (theoTruc[c.truc] = {dung:0, tong:0});
    t.tong++; if(ok) t.dung++;
  });

  var thoDiem = de.length ? Math.round(dung / de.length * 100) : 0;

  /* Điểm có trọng số theo trục — chỉ tính những trục có mặt trong đề */
  var tongTs = 0, diemTs = 0;
  Object.keys(theoTruc).forEach(function(k){
    var w = Number(ts[k] || 0) || 1;
    tongTs += w;
    diemTs += w * (theoTruc[k].dung / theoTruc[k].tong);
  });
  var diem = tongTs ? Math.round(diemTs / tongTs * 100) : thoDiem;

  var nguong = (b && b.dat) || vaiObj(vai).dat || 70;
  var yeu = Object.keys(theoTruc).filter(function(k){
    return (theoTruc[k].dung / theoTruc[k].tong) * 100 < nguong;
  });

  return {diem:diem, thoDiem:thoDiem, dung:dung, tong:de.length,
          nguong:nguong, dat: diem >= nguong, theoTruc:theoTruc, trucYeu:yeu};
};

/* ─── Trạng thái từng bài ─── */
G.shTrangThai = function(maBai){
  var d = kq()['bai|' + maBai];
  if(!d) return {ma:'chua'};
  if(!d.xong) return {ma:'dangLam', du:d};
  return {ma: d.dat ? 'dat' : 'truot', du:d};
};
G.shSoLanThi = function(maBai){
  return Number((kq()['solan|' + maBai]) || 0);
};
/* Tầng sau chỉ mở khi tầng trước đã đạt */
G.shMoDuoc = function(maBai){
  var i = (G.SH_TANG || []).map(function(x){ return x.ma; }).indexOf(maBai);
  if(i < 0) return true;                 /* bài tốt nghiệp không theo bậc thang này */
  if(i === 0) return true;
  return G.shTrangThai(G.SH_TANG[i-1].ma).ma === 'dat';
};
/* Cấp độ hành nghề hiện tại = tầng cao nhất đã đạt */
G.shCapCuaToi = function(){
  var cap = 'C0';
  (G.SH_TANG || []).forEach(function(t){
    if(G.shTrangThai(t.ma).ma === 'dat') cap = t.cap;
  });
  return cap;
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
var dangLam = null;      /* {ma, hat, tl:[], loNgay:false} */

function veCauHoi(c, i, chon){
  var T = trucObj(c.truc);
  return '<div class="card mt2">'+
    '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
      '<span class="mono tiny" style="color:var(--ink-4)">Câu '+(i+1)+'</span>'+
      '<span class="chip" style="color:'+T.c+'">'+h(T.ten)+'</span></div>'+
    '<p class="sm mt" style="line-height:1.75;font-weight:600">'+h(c.h)+'</p>'+
    '<div class="mt2">'+ c.p.map(function(x, j){
      var on = (chon === j);
      return '<button class="btn '+(on ? 'pri' : 'ghost')+' sm" data-shchon="'+i+'-'+j+'" '+
        'style="display:block;width:100%;text-align:left;margin-bottom:7px;white-space:normal;line-height:1.6">'+
        String.fromCharCode(65+j)+'. '+h(x)+'</button>';
    }).join('') +'</div></div>';
}

function manLamBai(){
  var b = baiObj(dangLam.ma);
  var de = G.shDe(dangLam.ma, dangLam.hat);
  var xong = dangLam.tl.filter(function(x){ return x != null; }).length;

  var o = U.ph({eyebrow:'ĐANG LÀM BÀI · KHÔNG BẤM RỜI MÀN', ic:'target', grad:1,
    t: b ? b.ten : dangLam.ma,
    lead:'Đề bốc ngẫu nhiên từ kho của đúng vai và đúng tầng. Chọn xong hết thì nút nộp mới hiện. '+
      'Chưa chắc thì cứ chọn — bài này để biết mình đang ở đâu, không để loại ai.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[xong + ' / ' + de.length, 'ĐÃ TRẢ LỜI', xong === de.length ? 'var(--ok)' : 'var(--gita)'],
     [(b && b.phut ? b.phut + ' phút' : '—'), 'THỜI LƯỢNG GỢI Ý', 'var(--gita)'],
     [((b && b.dat) || 70) + '%', 'NGƯỠNG ĐẠT', 'var(--gita)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  de.forEach(function(c, i){ o += veCauHoi(c, i, dangLam.tl[i]); });

  o += '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
    (xong === de.length
      ? '<button class="btn pri" data-shnop="1">'+ic('check','w-4 h-4')+' Nộp bài</button>'
      : '<span class="chip">Còn '+(de.length - xong)+' câu chưa chọn</span>')+
    '<button class="btn ghost" data-shhuy="1">Thoát, làm lại sau</button></div>';
  return o;
}

function manKetQua(maBai){
  var d = kq()['bai|' + maBai];
  var b = baiObj(maBai);
  var vai = G.shVaiCuaToi();

  var o = U.ph({eyebrow: d.dat ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT · VÀ ĐÂY LÀ VIỆC TIẾP THEO', ic:'shield', grad:1,
    t:(b ? b.ten : maBai) + ' — ' + d.diem + '%',
    lead: d.dat
      ? 'Đạt ngưỡng ' + d.nguong + '%. Bài này xác nhận cấp độ hành nghề, không phải một danh hiệu — '+
        'kỳ định kỳ tới vẫn phải thi lại.'
      : 'Chưa đạt ngưỡng ' + d.nguong + '%. Không ai bị đuổi vì một bài thi. Cấp độ hành nghề giữ nguyên ở mức '+
        'đã xác nhận, phần thiếu được mở thành khoá học, và thi lại sau 14 ngày.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[d.diem + '%', 'ĐIỂM CÓ TRỌNG SỐ', d.dat ? 'var(--ok)' : 'var(--gita-do-ink)'],
     [d.dung + ' / ' + d.tong, 'CÂU ĐÚNG', 'var(--gita)'],
     [d.nguong + '%', 'NGƯỠNG CỦA BÀI', 'var(--gita)'],
     [String(G.shSoLanThi(maBai)), 'LẦN THI', 'var(--gita)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  /* Từng trục */
  o += U.sec('TÁM TRỤC · KẾT QUẢ TỪNG TRỤC','Trục nào dưới ngưỡng thì khoá học của trục đó được mở ra');
  var tt = d.theoTruc || {};
  o += '<div class="card">'+ Object.keys(tt).map(function(k){
    var T = trucObj(k), pt = Math.round(tt[k].dung / tt[k].tong * 100);
    var ok = pt >= d.nguong;
    return '<div class="mt2">'+
      '<div class="row" style="gap:9px;align-items:center;flex-wrap:wrap">'+
        ic(T.ic,'w-4 h-4')+'<b class="sm" style="flex:1;min-width:170px;color:'+T.c+'">'+h(T.ten)+'</b>'+
        '<span class="mono sm" style="color:'+(ok ? 'var(--ok)' : 'var(--gita-do-ink)')+'">'+pt+'%</span>'+
        '<span class="tiny muted">'+tt[k].dung+'/'+tt[k].tong+'</span></div>'+
      U.bar(pt, ok ? 'var(--ok)' : 'var(--gita-do)')+
      '<p class="tiny muted mt" style="line-height:1.6">'+h(T.y)+'</p></div>';
  }).join('') +'</div>';

  /* Khoá học mở ra */
  if((d.trucYeu || []).length){
    o += U.sec('KHOÁ HỌC ĐÃ MỞ CHO PHẦN CÒN THIẾU','Kết quả không bao giờ chỉ là một con số');
    o += '<div class="card" style="border-color:var(--gita-vien-1)">'+
      d.trucYeu.map(function(k){
        var T = trucObj(k);
        var mo = (G.KH_BAI || []).filter(function(x){ return x.truc === k && x.vai.indexOf(vai) >= 0; });
        return '<div class="mt2"><b class="sm" style="color:'+T.c+'">'+h(T.ten)+'</b>'+
          (mo.length
            ? '<ul class="tiny mt" style="line-height:1.7;padding-left:18px;margin:0">'+
              G.dsHet(mo,3).map(function(x){ return '<li>'+h(x.ten)+'</li>'; }).join('')+'</ul>'
            : '<p class="tiny mt muted">Bài học cho trục này đang được biên soạn.</p>')+
        '</div>';
      }).join('')+
      '<button class="btn pri sm mt2" data-v="khoa-dao-tao">Mở khoá đào tạo</button></div>';
  }

  o += '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
    '<button class="btn ghost" data-shve="1">Về danh sách bài</button>'+
    (!d.dat && G.shSoLanThi(maBai) < 3
      ? '<button class="btn ghost" data-shthi="'+h(maBai)+'">Thi lại</button>'
      : (!d.dat ? '<span class="chip" style="color:var(--gita-do-ink)">Đã thi 3 lần — học lại trọn khoá rồi mới thi tiếp</span>' : ''))+
  '</div>';
  return o;
}

G.VIEWS['sat-hach'] = function(){
  if(dangLam) return manLamBai();
  if(G.S && G.S.shXem) return manKetQua(G.S.shXem);

  var vai = G.shVaiCuaToi();
  var V = vaiObj(vai);
  var cap = G.shCapCuaToi();
  var soKho = G.shKhoCua(vai).length;

  var o = U.ph({eyebrow:'NĂM TẦNG NĂNG LỰC · BỐN BÀI TỐT NGHIỆP · TÁM TRỤC', ic:'shield', grad:1,
    t:'Sát hạch năng lực — ' + V.ten,
    lead: V.y + ' Bài kiểm tra ở đây không dùng để loại người. Nó trả lời đúng một câu: '+
      'mình đang ở cấp độ nào, và cần học gì tiếp.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[cap === 'C0' ? 'Chưa có' : cap, 'CẤP ĐỘ HÀNH NGHỀ', cap === 'C0' ? 'var(--ink-4)' : 'var(--ok)'],
     [V.dat + '%', 'NGƯỠNG ĐẠT CỦA VAI', V.c],
     [String(soKho), 'CÂU TRONG KHO CỦA VAI', 'var(--gita)'],
     [String((G.SH_TRUC || []).length), 'TRỤC ĐÁNH GIÁ', 'var(--gita)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  o += '<div class="card mt2" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75"><b>Nhịp thi của vai này:</b> '+h(V.nhip)+'</p></div>';

  /* Tám trục và trọng số */
  var ts = (G.SH_TRONGSO || {})[vai] || {};
  o += U.sec('TÁM TRỤC ĐÁNH GIÁ','Trọng số khác nhau theo vai — của vai này ghi ở cột cuối');
  o += U.tbl(['Trục','Đo cái gì','Trọng số'], (G.SH_TRUC || []).map(function(t){
    return ['<b class="sm" style="color:'+t.c+'">'+h(t.ten)+'</b>',
      '<span class="tiny">'+h(t.y)+'</span>',
      '<span class="mono sm">'+(ts[t.ma] || 0)+'%</span>'];
  }));

  /* Năm tầng */
  o += U.sec('NĂM TẦNG NĂNG LỰC','Không nhảy tầng — chưa qua tầng trước thì tầng sau không mở');
  (G.SH_TANG || []).forEach(function(t){
    var tt = G.shTrangThai(t.ma);
    var mo = G.shMoDuoc(t.ma);
    var lan = G.shSoLanThi(t.ma);
    var kho = G.shKhoCua(vai, t.ma).length;
    var mau = tt.ma === 'dat' ? 'var(--ok)' : (mo ? t.c : 'var(--line)');

    o += '<div class="card mt2" style="border-left:3px solid '+mau+'">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="mono tiny" style="color:'+t.c+'">'+h(t.ma)+' · '+h(t.cap)+'</span>'+
        '<b style="flex:1;min-width:170px;font-size:16px">'+h(t.ten)+'</b>'+
        '<span class="chip">'+t.cau+' câu · '+t.phut+' phút · đạt '+t.dat+'%</span>'+
        (tt.ma === 'dat' ? '<span class="chip" style="color:var(--ok)">✓ Đã đạt '+tt.du.diem+'%</span>'
         : tt.ma === 'truot' ? '<span class="chip" style="color:var(--gita-do-ink)">Chưa đạt '+tt.du.diem+'%</span>'
         : '<span class="chip" style="color:var(--ink-4)">Chưa thi</span>')+
      '</div>'+
      '<p class="sm mt" style="line-height:1.7"><b>Bài này hỏi:</b> '+h(t.hoi)+'</p>'+
      '<p class="tiny mt muted" style="line-height:1.65"><b>Vào được khi:</b> '+h(t.vao)+'</p>'+
      '<p class="tiny muted">Kho câu hỏi của tầng này: '+kho+' câu'+(lan ? ' · đã thi '+lan+' lần' : '')+'</p>'+
      '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
        (!mo
          ? '<span class="chip" style="color:var(--ink-4)">'+ic('lock','w-3 h-3')+' Mở sau khi đạt tầng trước</span>'
          : (tt.ma === 'dat'
              ? '<button class="btn ghost sm" data-shxem="'+h(t.ma)+'">Xem lại kết quả</button>'
              : (lan >= 3
                  ? '<span class="chip" style="color:var(--gita-do-ink)">Đã thi 3 lần — học lại trọn khoá rồi mới thi tiếp</span>'
                  : '<button class="btn pri sm" data-shthi="'+h(t.ma)+'">'+(lan ? 'Thi lại' : 'Bắt đầu thi')+'</button>'))
        )+
        (tt.ma !== 'chua' ? '<button class="btn ghost sm" data-shxem="'+h(t.ma)+'">Kết quả lần gần nhất</button>' : '')+
      '</div></div>';
  });

  /* Bốn bài tốt nghiệp */
  o += U.sec('BỐN BÀI TỐT NGHIỆP CUỐI CHU KỲ','Mở khi đã đi đủ số ngày — tính từ sổ nhật ký');
  var daDi = G.nkSoNgayDaDi ? G.nkSoNgayDaDi() : 1;
  (G.SH_TOTNGHIEP || []).forEach(function(t){
    var tt = G.shTrangThai(t.ma);
    var mo = daDi >= t.ngay;
    o += '<div class="card mt2" style="border-left:3px solid '+(tt.ma === 'dat' ? 'var(--ok)' : (mo ? t.c : 'var(--line)'))+'">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<b style="flex:1;min-width:200px;font-size:16px">'+h(t.ten)+'</b>'+
        '<span class="chip">'+t.cau+' câu · '+t.phut+' phút · đạt '+t.dat+'%</span>'+
        '<span class="chip" style="color:'+t.c+'">'+t.truc.length+' trục</span>'+
        (tt.ma === 'dat' ? '<span class="chip" style="color:var(--ok)">✓ '+tt.du.diem+'%</span>' : '')+
      '</div>'+
      '<p class="sm mt" style="line-height:1.7">'+h(t.y)+'</p>'+
      '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
        (mo
          ? (tt.ma === 'dat'
              ? '<button class="btn ghost sm" data-shxem="'+h(t.ma)+'">Xem lại kết quả</button>'
              : '<button class="btn pri sm" data-shthi="'+h(t.ma)+'">'+(tt.ma === 'truot' ? 'Thi lại' : 'Bắt đầu thi')+'</button>')
          : '<span class="chip" style="color:var(--ink-4)">Mở ở ngày thứ '+t.ngay+' · hiện tại ngày '+daDi+'</span>')+
      '</div></div>';
  });

  /* Luật */
  o += U.sec('LUẬT THI','Đọc trước — không ai bị loại vì một điều mình không biết');
  o += '<div class="card">'+ (G.SH_LUAT || []).map(function(x, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : '')+'">'+
      '<b class="sm">'+(i+1)+'. '+h(x.t)+'</b>'+
      '<p class="tiny mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
  }).join('') +'</div>';

  return o;
};

/* ═══════════════ BẤM ═══════════════ */
document.addEventListener('click', function(e){
  var t = e.target;
  if(!t || !t.closest) return;

  var b = t.closest('[data-shthi]');
  if(b){
    var ma = b.getAttribute('data-shthi');
    if(!G.shMoDuoc(ma)){ U.toast('Tầng trước chưa đạt. Không nhảy tầng.','err'); return; }
    if(G.shSoLanThi(ma) >= 3 && G.shTrangThai(ma).ma !== 'dat'){
      U.toast('Đã thi ba lần. Học lại trọn khoá của tầng này rồi mới thi tiếp.','err'); return;
    }
    var de = G.shDe(ma, Date.now() >>> 0);
    if(!de.length){ U.toast('Kho câu hỏi của tầng này chưa có bài.','err'); return; }
    dangLam = {ma:ma, hat: Date.now() >>> 0, tl: new Array(de.length).fill(null)};
    dangLam.tl = new Array(G.shDe(ma, dangLam.hat).length).fill(null);
    if(G.S) G.S.shXem = null;
    if(G.render) G.render();
    return;
  }

  var c = t.closest('[data-shchon]');
  if(c && dangLam){
    var p = c.getAttribute('data-shchon').split('-');
    dangLam.tl[Number(p[0])] = Number(p[1]);
    if(G.render) G.render();
    return;
  }

  if(t.closest('[data-shhuy]')){
    dangLam = null;
    if(G.render) G.render();
    return;
  }

  if(t.closest('[data-shnop]') && dangLam){
    var de2 = G.shDe(dangLam.ma, dangLam.hat);
    var r = G.shCham(dangLam.ma, de2, dangLam.tl);
    var lan = G.shSoLanThi(dangLam.ma) + 1;
    ghi('solan|' + dangLam.ma, lan);
    ghi('bai|' + dangLam.ma, {
      ma: dangLam.ma, xong:1, diem:r.diem, dung:r.dung, tong:r.tong,
      nguong:r.nguong, dat: r.dat ? 1 : 0, theoTruc:r.theoTruc, trucYeu:r.trucYeu,
      luc: new Date().toLocaleDateString('vi-VN'), lan: lan
    });
    if(G.secLog) G.secLog('Sát hạch', dangLam.ma + ' · ' + r.diem + '% · lần ' + lan,
      r.dat ? 'Đạt' : 'Chưa đạt');
    if(G.S) G.S.shXem = dangLam.ma;
    dangLam = null;
    if(G.render) G.render();
    return;
  }

  var x = t.closest('[data-shxem]');
  if(x){ if(G.S) G.S.shXem = x.getAttribute('data-shxem'); dangLam = null; if(G.render) G.render(); return; }
  if(t.closest('[data-shve]')){ if(G.S) G.S.shXem = null; if(G.render) G.render(); }
});

})();
