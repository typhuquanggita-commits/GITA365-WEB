/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM — KHO PHIM TRÊN GOOGLE DRIVE (gói 2TB của chủ hệ)

   Mọi phim của hệ thống nằm trong Drive: "GITA365 · Kho phim/Phim/<năm-tháng>/".
   Màn này đọc kho qua Web app Apps Script riêng (xuong-phim-ai/kho-drive/), chạy bằng
   chính tài khoản Drive của chủ hệ — không qua dịch vụ trả phí nào.
     · đồng hồ dung lượng Drive · danh sách phim · xem ngay (trình xem Drive)
     · bật/tắt chia sẻ link · chép link · bỏ vào Thùng rác (giữ 30 ngày)
   Phim làm ở đâu (máy dựng, điện thoại…) cứ kéo vào thư mục Phim trên Drive là màn này thấy.
   Trình duyệt chỉ giữ địa chỉ Web app + KHOA_APP (localStorage). G.khoDrive dùng chung cho
   màn "Làm phim nhanh" (đường miễn phí). View con của san-xuat-ai, tab "Kho phim".
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  function lsGet(k){ try{ return window.localStorage.getItem(k)||''; }catch(e){ return ''; } }
  function lsSet(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }

  var kd = G.khoDrive = G.khoDrive || {};
  kd.cfg = function(){ return { url: lsGet('axDriveUrl'), khoa: lsGet('axDriveKhoa') }; };
  kd.coKho = function(){ var c=kd.cfg(); return !!(c.url && c.khoa); };
  kd.goi = function(viec, data){
    var c = kd.cfg();
    if(!c.url || !c.khoa) return Promise.reject(new Error('Chưa nối kho Drive — mở "Cài đặt kho" ở tab Kho phim.'));
    var than = Object.assign({ khoa:c.khoa, viec:viec }, data||{});
    return fetch(c.url, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(than) })
      .then(function(r){ return r.json(); })
      .then(function(d){ if(d && d.loi) throw new Error(d.loi); return d; });
  };
  kd.xem = function(id){ return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview'; };
  kd.link = function(id){ return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view'; };

  var st = { phim:null, dung:null, loi:'', dangTai:false, xem:'' };
  function ve(){ if(G.render) G.render(); }
  function gb(b){ return (b/1e9).toLocaleString('vi-VN',{maximumFractionDigits:1})+' GB'; }
  function mb(b){ return b>=1e9 ? gb(b) : Math.max(1,Math.round(b/1e6))+' MB'; }

  kd.tai = function(){
    if(!kd.coKho() || st.dangTai) return;
    st.dangTai=true; st.loi=''; ve();
    Promise.all([kd.goi('kiemTra'), kd.goi('danhSach')]).then(function(kq){
      st.dung = kq[0]; st.phim = kq[1].phim||[]; st.dangTai=false; ve();
    }).catch(function(e){ st.loi=e.message||String(e); st.dangTai=false; ve(); });
  };
  kd.luuCaiDat = function(){
    var u=((document.getElementById('kd-url')||{}).value||'').trim(), k=((document.getElementById('kd-khoa')||{}).value||'').trim();
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u)) return U.toast('Địa chỉ phải dạng https://script.google.com/macros/s/…/exec','err');
    if(k.length<24) return U.toast('KHOA_APP chưa đúng (chuỗi dài in ra khi chạy caiDat).','err');
    lsSet('axDriveUrl',u); lsSet('axDriveKhoa',k); st.phim=null; U.toast('Đã nối kho Drive trên máy này.','ok'); kd.tai();
  };
  kd.moXem = function(id){ st.xem = (st.xem===id ? '' : id); ve(); };
  kd.chiaSe = function(id, bat){
    kd.goi('chiaSe',{id:id, congKhai:bat}).then(function(d){
      (st.phim||[]).forEach(function(p){ if(p.id===id) p.congKhai=bat; });
      U.toast(bat?'Đã bật chia sẻ: ai có link đều xem được.':'Đã tắt chia sẻ: chỉ chủ kho xem.','ok'); ve();
      if(bat && navigator.clipboard) navigator.clipboard.writeText(d.link).catch(function(){});
    }).catch(function(e){ U.toast(e.message,'err'); });
  };
  kd.chep = function(id){ var l=kd.link(id);
    if(navigator.clipboard) navigator.clipboard.writeText(l).then(function(){ U.toast('Đã chép link.','ok'); }, function(){ U.toast(l,'ok'); });
    else U.toast(l,'ok'); };
  kd.xoa = function(id, ten){
    if(!window.confirm('Bỏ phim "'+ten+'" vào Thùng rác Drive? (khôi phục được trong 30 ngày)')) return;
    kd.goi('xoa',{id:id}).then(function(){ st.phim=(st.phim||[]).filter(function(p){ return p.id!==id; }); U.toast('Đã bỏ vào Thùng rác.','ok'); ve(); })
      .catch(function(e){ U.toast(e.message,'err'); });
  };

  kd.ve = function(){
    var c = kd.cfg();
    var o = U.sec('Kho phim · Google Drive','Mọi phim GITA365 lưu trong Drive 2TB của anh/chị — xem, chia sẻ, tải về ở một chỗ');
    if(kd.coKho()){
      if(!st.phim && !st.dangTai && !st.loi) setTimeout(kd.tai, 0);
      var d = st.dung, pt = d && d.toiDa ? Math.min(100, d.daDung/d.toiDa*100) : 0;
      o += '<div class="card pad-sm mb"><div class="row" style="justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap">'+
          '<b class="sm">Dung lượng Drive</b><span class="tiny muted">'+(d? gb(d.daDung)+' / '+gb(d.toiDa)+' · còn '+gb(Math.max(0,d.toiDa-d.daDung)) : (st.dangTai?'đang đọc…':''))+'</span></div>'+
        '<div style="height:10px;border-radius:6px;background:var(--line);overflow:hidden;margin-top:8px"><div style="height:100%;width:'+pt.toFixed(1)+'%;background:'+(pt>90?'#B42318':(pt>75?'#B4720F':'#0B7350'))+'"></div></div>'+
        '<p class="bd-tip" style="margin-top:6px">Một phim 60 giây 1080p ≈ 40–80 MB → 2TB chứa được hàng chục nghìn phim. '+
          (d? (d.noiMay?'Máy dựng miễn phí: <b>đã nối</b>.':'Máy dựng miễn phí: <b>chưa nối</b> (GH_TOKEN) — phim vẫn lưu được, việc làm phim cần bấm tay trên GitHub.') : '')+'</p>'+
        '<div class="row mt" style="gap:8px"><button class="btn ghost sm" onclick="G.khoDrive.tai()">'+(st.dangTai?'Đang tải…':'↻ Làm mới')+'</button>'+
        '<a class="btn ghost sm" target="_blank" rel="noopener" href="'+(d&&/^[A-Za-z0-9_-]+$/.test(d.thuMuc||'')?'https://drive.google.com/drive/folders/'+d.thuMuc:'https://drive.google.com/drive/search?q=%22GITA365%20%C2%B7%20Kho%20phim%22')+'">Mở thư mục trên Drive</a></div></div>';
      if(st.loi) o += '<p class="bd-tip" style="color:#B42318">'+h(st.loi)+'</p>';
      if(st.phim){
        if(!st.phim.length) o += '<div class="card pad-sm mb"><p class="tiny muted">Kho chưa có phim. Phim làm xong ở tab "Làm phim nhanh" sẽ tự vào đây; phim có sẵn thì kéo vào thư mục <b>GITA365 · Kho phim/Phim</b> trên Drive.</p></div>';
        o += st.phim.map(function(p){
          var dang = st.xem===p.id;
          return '<div class="card pad-sm mb"><div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center">'+
              '<div style="min-width:0;flex:1"><b class="sm" style="word-break:break-word">🎬 '+h(p.ten)+'</b>'+
                '<div class="tiny muted">'+h(new Date(p.ngay).toLocaleString('vi-VN'))+' · '+mb(p.kichThuoc)+(p.thuMuc?' · '+h(p.thuMuc):'')+' · '+
                (p.congKhai?'<span style="color:#0B7350">đang chia sẻ link</span>':'riêng tư')+'</div></div>'+
              '<div class="row" style="gap:6px;flex-wrap:wrap">'+
                '<button class="btn sm" onclick="G.khoDrive.moXem(\''+h(p.id)+'\')">'+(dang?'Đóng':'▶ Xem')+'</button>'+
                '<a class="btn ghost sm" target="_blank" rel="noopener" href="'+h(kd.link(p.id))+'">Mở Drive / Tải</a>'+
                (p.congKhai ? '<button class="btn ghost sm" onclick="G.khoDrive.chep(\''+h(p.id)+'\')">Chép link</button><button class="btn ghost sm" onclick="G.khoDrive.chiaSe(\''+h(p.id)+'\',false)">Tắt chia sẻ</button>'
                            : '<button class="btn ghost sm" onclick="G.khoDrive.chiaSe(\''+h(p.id)+'\',true)">Chia sẻ link</button>')+
                '<button class="btn ghost sm" onclick="G.khoDrive.xoa(\''+h(p.id)+'\',\''+h(p.ten.replace(/[\'"\\]/g,''))+'\')">Bỏ</button></div></div>'+
            (dang ? '<div style="position:relative;width:100%;max-width:520px;aspect-ratio:9/16;margin:10px auto 0;max-height:75vh">'+
                '<iframe src="'+h(kd.xem(p.id))+'" allow="autoplay; fullscreen" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;background:#000"></iframe></div>'+
                '<p class="tiny muted" style="text-align:center;margin-top:4px">Phim vừa tải lên cần vài phút để Drive xử lý trước khi xem được.</p>' : '')+
            '</div>';
        }).join('');
      }
    }
    o += '<details class="card pad-sm"'+(kd.coKho()?'':' open')+'><summary class="sm" style="cursor:pointer"><b>Cài đặt kho Drive</b> <span class="tiny muted">'+(kd.coKho()?'· đã nối':'· làm một lần')+'</span></summary>'+
      '<div class="grid g2 mt" style="gap:8px"><input id="kd-url" type="url" placeholder="https://script.google.com/macros/s/…/exec" value="'+h(c.url)+'" style="padding:8px;border:1px solid var(--line);border-radius:8px">'+
      '<input id="kd-khoa" type="password" placeholder="KHOA_APP" value="'+h(c.khoa)+'" style="padding:8px;border:1px solid var(--line);border-radius:8px"></div>'+
      '<div class="row mt"><button class="btn sm" onclick="G.khoDrive.luuCaiDat()">Lưu & kiểm tra</button></div>'+
      '<p class="bd-tip">Hướng dẫn 10 phút: <b>xuong-phim-ai/kho-drive/README-kho-drive.md</b> — dán mã vào Apps Script, chạy <b>caiDat</b>, triển khai Web app, dán địa chỉ + KHOA_APP vào đây.</p></details>';
    return o;
  };
})();
