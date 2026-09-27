/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.0 — SẮP XẾP THƯ MỤC VÀ MỤC HIỂN THỊ
   Chủ hệ thống tự đổi bố cục thanh trái ngay trong ứng dụng: đổi thứ
   tự thư mục, ẩn bớt, thêm thư mục mới, chuyển mục sang thư mục khác.

   Chỉ lưu phần KHÁC so với gốc. Bản gốc trong mã nguồn không bao giờ
   bị ghi đè, nên "trả về mặc định" lúc nào cũng dùng được. Bản sắp xếp
   đi cùng bản sửa chữ qua đường đồng bộ, nên máy tính và bản web thấy
   như nhau ngay lần đồng bộ kế tiếp.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var KEY = 'gita365_sapxep';
var U = G.U;

function moi(){ return {thuTuNhom:[], anNhom:[], nhomThem:[], viTri:{}, anMuc:[]}; }

G.SAP_XEP = (function(){
  try{
    var d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if(!d || typeof d !== 'object') return moi();
    var g = moi();
    ['thuTuNhom','anNhom','anMuc'].forEach(function(k){ if(Array.isArray(d[k])) g[k] = d[k]; });
    if(Array.isArray(d.nhomThem)) g.nhomThem = d.nhomThem;
    if(d.viTri && typeof d.viTri === 'object') g.viTri = d.viTri;
    return g;
  }catch(e){ return moi(); }
})();

function luu(){
  try{ localStorage.setItem(KEY, JSON.stringify(G.SAP_XEP)); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('sapxep');
}

/* ─── Bố cục đang dùng = bản gốc + phần đã sắp xếp lại ─── */
G.navDung = function(){
  var S = G.SAP_XEP;
  var goc = (G.NAV || []).map(function(g){
    return {id:g.id, no:g.no, ic:g.ic, c:g.c, t:g.t, s:g.s, essence:g.essence, items:[]};
  });
  S.nhomThem.forEach(function(n){
    goc.push({id:n.id, no:n.no || '＋', ic:n.ic || 'star', c:n.c || '#2A72C6',
      t:n.t, s:n.s || '', essence:n.essence || '', items:[], them:1});
  });
  var theoId = {};
  goc.forEach(function(g){ theoId[g.id] = g; });

  /* xếp từng mục vào thư mục của nó */
  (G.NAV || []).forEach(function(g){
    g.items.forEach(function(it){
      if(S.anMuc.indexOf(it.v) >= 0) return;
      var v = S.viTri[it.v] || {};
      var dich = theoId[v.nhom] || theoId[g.id];
      if(!dich) dich = theoId[g.id];
      dich.items.push({it:it, thuTu: (v.thuTu === undefined ? 1000 + dich.items.length : v.thuTu)});
    });
  });
  goc.forEach(function(g){
    g.items.sort(function(a,b){ return a.thuTu - b.thuTu; });
    g.items = g.items.map(function(x){ return x.it; });
  });

  /* thứ tự thư mục */
  var thu = S.thuTuNhom.filter(function(id){ return theoId[id]; });
  goc.forEach(function(g){ if(thu.indexOf(g.id) < 0) thu.push(g.id); });
  var ra = thu.map(function(id){ return theoId[id]; })
    .filter(function(g){ return g && S.anNhom.indexOf(g.id) < 0; });
  return ra;
};

/* ─── Thao tác ─── */
function duocSua(){
  if(G.can('sua_noi_dung')) return true;
  U.toast('Chỉ Super Admin sắp xếp được bố cục.','err');
  return false;
}
function ghi(viec, chiTiet){
  luu();
  if(G.secLog) G.secLog('Sắp xếp bố cục', viec + ' · ' + chiTiet + ' · ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');
  G.render();
}

G.doiChoNhom = function(id, huong){
  if(!duocSua()) return;
  var ds = G.navDung().map(function(g){ return g.id; });
  var i = ds.indexOf(id), j = i + huong;
  if(i < 0 || j < 0 || j >= ds.length) return;
  var t = ds[i]; ds[i] = ds[j]; ds[j] = t;
  G.SAP_XEP.thuTuNhom = ds;
  ghi('Đổi chỗ thư mục', id + ' ' + (huong < 0 ? 'lên' : 'xuống'));
};

G.anHienNhom = function(id){
  if(!duocSua()) return;
  var a = G.SAP_XEP.anNhom, i = a.indexOf(id);
  if(i >= 0) a.splice(i,1); else a.push(id);
  ghi(i >= 0 ? 'Hiện lại thư mục' : 'Ẩn thư mục', id);
};

G.anHienMuc = function(v){
  if(!duocSua()) return;
  var a = G.SAP_XEP.anMuc, i = a.indexOf(v);
  if(i >= 0) a.splice(i,1); else a.push(v);
  ghi(i >= 0 ? 'Hiện lại mục' : 'Ẩn mục', v);
};

G.chuyenMuc = function(v, nhomMoi){
  if(!duocSua()) return;
  G.SAP_XEP.viTri[v] = G.SAP_XEP.viTri[v] || {};
  G.SAP_XEP.viTri[v].nhom = nhomMoi;
  ghi('Chuyển mục sang thư mục khác', v + ' → ' + nhomMoi);
};

G.doiChoMuc = function(v, huong){
  if(!duocSua()) return;
  var nav = G.navDung();
  var g = nav.filter(function(x){ return x.items.some(function(i){ return i.v === v; }); })[0];
  if(!g) return;
  var ds = g.items.map(function(i){ return i.v; });
  var i = ds.indexOf(v), j = i + huong;
  if(j < 0 || j >= ds.length) return;
  var t = ds[i]; ds[i] = ds[j]; ds[j] = t;
  ds.forEach(function(x, k){
    G.SAP_XEP.viTri[x] = G.SAP_XEP.viTri[x] || {};
    G.SAP_XEP.viTri[x].nhom = g.id;
    G.SAP_XEP.viTri[x].thuTu = k;
  });
  ghi('Đổi chỗ mục', v + ' ' + (huong < 0 ? 'lên' : 'xuống'));
};

G.themNhom = function(){
  if(!duocSua()) return;
  var t = (document.getElementById('sx_ten')||{}).value || '';
  t = t.trim();
  if(t.length < 3){ U.toast('Đặt tên thư mục dài hơn một chút.','err'); return; }
  var id = 'gx' + (G.SAP_XEP.nhomThem.length + 1) + '-' + Date.now().toString(36).slice(-4);
  G.SAP_XEP.nhomThem.push({id:id, t:t.toUpperCase(),
    s:(document.getElementById('sx_hoi')||{}).value || '', ic:'star', c:'#2A72C6', no:'＋'});
  ghi('Thêm thư mục', t);
};

G.xoaNhomThem = function(id){
  if(!duocSua()) return;
  G.SAP_XEP.nhomThem = G.SAP_XEP.nhomThem.filter(function(n){ return n.id !== id; });
  Object.keys(G.SAP_XEP.viTri).forEach(function(v){
    if(G.SAP_XEP.viTri[v].nhom === id) delete G.SAP_XEP.viTri[v].nhom;
  });
  ghi('Xoá thư mục tự thêm', id);
};

G.traBoCuc = function(){
  if(!duocSua()) return;
  G.SAP_XEP = moi();
  ghi('Trả bố cục về mặc định', 'toàn bộ');
  U.toast('Đã trả bố cục về như bản gốc.','ok');
};
})();
