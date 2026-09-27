/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KẾ TOÁN – THUẾ  (9.99.210)

   Backend thật cho trung tâm Kế toán–Thuế: sổ kép · hoá đơn · kê khai
   thuế · báo cáo. Trước đây màn chỉ có số minh hoạ; nay nối cửa thật,
   số đọc TỪ sổ.

   Ba luật nền của phần này:
   1. SỐ DƯ TÍNH LÚC ĐỌC từ bút toán, KHÔNG giữ cột "số dư" — cột như thế
      hoặc bị gõ đè (một phép đo thành lời khai) hoặc cũ đi lặng lẽ. Cùng
      luật cột conHan (9.99.63), cột den (9.99.66).
   2. BÚT TOÁN KÉP có răng: Nợ phải khác Có, số tiền > 0. Ghi lệch thì
      sổ không cân, và một sổ không cân là một sổ nói dối lặng lẽ.
   3. Cổng ở MÁY CHỦ (R01–R03 · fin_view), không ở màn. Đọc cũng gác,
      vì con số tài chính chỉ R01–R03 xem (luật tài chính 9.97).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* Cổng tài chính: R01–R03 (luật "tài chính chỉ R01–R03", 9.97). */
function gac(hoSo){ return (BAC[hoSo && hoSo.role] || 99) <= 3; }
function chan(){ return {ok:false, code:'NOPERM', error:'Chỉ R01–R03 (fin_view) vào được Kế toán–Thuế.'}; }

/* Loại thuế hợp lệ + trạng thái tờ khai. */
const THUE = ['GTGT','TNCN','TNDN','MONBAI'];
const TT_KHAI = ['chuaKhai','daKhai','daNop'];

/* ── BÚT TOÁN KÉP ── */
export async function ghiButToan(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const tkNo = String(y.tkNo||'').trim(), tkCo = String(y.tkCo||'').trim();
  const soTien = Math.round(Number(y.soTien)||0);
  const dienGiai = String(y.dienGiai||'').trim().slice(0,300);
  if(!tkNo || !tkCo) return {ok:false, error:'Thiếu tài khoản Nợ hoặc Có.'};
  if(tkNo === tkCo) return {ok:false, code:'NOCO', error:'Tài khoản Nợ phải KHÁC tài khoản Có.'};
  if(soTien <= 0) return {ok:false, code:'SOAM', error:'Số tiền phải lớn hơn 0.'};
  if(!dienGiai) return {ok:false, error:'Cần diễn giải bút toán.'};
  const ngay = String(y.ngay||'').trim() || new Date().toISOString().slice(0,10);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO ketToanButToan (ngay,dienGiai,tkNo,tkCo,soTien,chungTu,nguoiGhi,ghiLuc) '+
    'VALUES (?,?,?,?,?,?,?,?)'
  ).bind(ngay, dienGiai, tkNo, tkCo, soTien, String(y.chungTu||'').slice(0,60)||null, hoSo.u, luc).run();
  await Kho.ghiNhatKy(db, {uid:hoSo.uid, username:hoSo.u, viec:'KT_BUTTOAN',
    doiTuong:tkNo+'/'+tkCo, chiTiet:soTien+'đ · '+dienGiai});
  return {ok:true, tkNo, tkCo, soTien};
}

/* Sổ + số dư từng tài khoản, tính LÚC ĐỌC. */
export async function docSoKeToan(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const rs = await db.prepare('SELECT tkNo,tkCo,soTien FROM ketToanButToan').all();
  const rows = (rs && rs.results) || [];
  const du = {};
  for(const r of rows){
    du[r.tkNo] = (du[r.tkNo]||0) + Number(r.soTien||0);   /* ghi Nợ tăng dư Nợ */
    du[r.tkCo] = (du[r.tkCo]||0) - Number(r.soTien||0);   /* ghi Có giảm (thành dư Có) */
  }
  const tk = Object.keys(du).sort().map(k => ({
    tk:k, du: du[k], no: du[k] > 0 ? du[k] : 0, co: du[k] < 0 ? -du[k] : 0
  }));
  const tongNo = tk.reduce((s,x)=>s+x.no,0), tongCo = tk.reduce((s,x)=>s+x.co,0);
  const gd = await db.prepare('SELECT COUNT(*) n FROM ketToanButToan').first();
  return {ok:true, tk, tongNo, tongCo, canDoi: tongNo===tongCo, soButToan:(gd&&gd.n)||0};
}

/* ── HOÁ ĐƠN ── */
export async function ghiHoaDon(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const soHD = String(y.soHD||'').trim();
  const loai = String(y.loai||'').trim();
  const doiTuong = String(y.doiTuong||'').trim().slice(0,120);
  const tienHang = Math.round(Number(y.tienHang)||0);
  const thueSuat = Number(y.thueSuat)||0;
  if(!soHD) return {ok:false, error:'Thiếu số hoá đơn.'};
  if(loai!=='ra' && loai!=='vao') return {ok:false, error:'Loại hoá đơn phải là "ra" hoặc "vao".'};
  if(tienHang<=0) return {ok:false, error:'Tiền hàng phải lớn hơn 0.'};
  const tienThue = Math.round(tienHang * thueSuat / 100);
  const ngay = String(y.ngay||'').trim() || new Date().toISOString().slice(0,10);
  await db.prepare(
    'INSERT INTO ketToanHoaDon (soHD,loai,doiTuong,tienHang,thueSuat,tienThue,ngay,daGhiSo,nguoiGhi,ghiLuc) '+
    'VALUES (?,?,?,?,?,?,?,0,?,?)'
  ).bind(soHD, loai, doiTuong||null, tienHang, thueSuat, tienThue, ngay, hoSo.u, new Date().toISOString()).run();
  await Kho.ghiNhatKy(db, {uid:hoSo.uid, username:hoSo.u, viec:'KT_HOADON',
    doiTuong:soHD, chiTiet:loai+' · '+tienHang+'đ · thuế '+tienThue});
  return {ok:true, soHD, tienThue};
}

export async function docHoaDon(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const rs = await db.prepare(
    'SELECT id,soHD,loai,doiTuong,tienHang,thueSuat,tienThue,ngay,daGhiSo FROM ketToanHoaDon '+
    'ORDER BY ngay DESC, id DESC LIMIT 200').all();
  const ds = (rs && rs.results) || [];
  return {ok:true, ds, chuaGhiSo: ds.filter(x=>!x.daGhiSo).length};
}

/* Ghi sổ một hoá đơn → tạo bút toán kép tương ứng, đánh dấu đã ghi. */
export async function ghiSoHoaDon(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const id = Number(y.id)||0;
  if(!id) return {ok:false, error:'Thiếu id hoá đơn.'};
  const hd = await db.prepare('SELECT * FROM ketToanHoaDon WHERE id=?').bind(id).first();
  if(!hd) return {ok:false, error:'Không tìm thấy hoá đơn.'};
  if(hd.daGhiSo) return {ok:false, code:'DAGHISO', error:'Hoá đơn này đã ghi sổ rồi.'};
  const luc = new Date().toISOString();
  /* Hoá đơn ra: Nợ 131 (phải thu) / Có 511 (doanh thu) + Có 3331 (thuế GTGT ra).
     Hoá đơn vào: Nợ 642 (chi phí) + Nợ 1331 (thuế GTGT vào) / Có 331 (phải trả). */
  const bt = [];
  if(hd.loai==='ra'){
    bt.push(['131','511', hd.tienHang, 'Doanh thu HĐ '+hd.soHD]);
    if(hd.tienThue>0) bt.push(['131','3331', hd.tienThue, 'Thuế GTGT ra HĐ '+hd.soHD]);
  } else {
    bt.push(['642','331', hd.tienHang, 'Chi phí HĐ '+hd.soHD]);
    if(hd.tienThue>0) bt.push(['1331','331', hd.tienThue, 'Thuế GTGT vào HĐ '+hd.soHD]);
  }
  const stmts = bt.map(b => db.prepare(
    'INSERT INTO ketToanButToan (ngay,dienGiai,tkNo,tkCo,soTien,chungTu,nguoiGhi,ghiLuc) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(hd.ngay, b[3], b[0], b[1], b[2], hd.soHD, hoSo.u, luc));
  stmts.push(db.prepare('UPDATE ketToanHoaDon SET daGhiSo=1 WHERE id=?').bind(id));
  await db.batch(stmts);
  await Kho.ghiNhatKy(db, {uid:hoSo.uid, username:hoSo.u, viec:'KT_GHISO',
    doiTuong:hd.soHD, chiTiet:bt.length+' bút toán'});
  return {ok:true, soHD:hd.soHD, soButToan:bt.length};
}

/* ── KÊ KHAI THUẾ ── */
export async function ghiToKhai(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const loai = String(y.loai||'').trim();
  const ky = String(y.ky||'').trim().slice(0,40);
  const soTien = Math.round(Number(y.soTien)||0);
  const trangThai = String(y.trangThai||'chuaKhai').trim();
  if(THUE.indexOf(loai)<0) return {ok:false, error:'Sắc thuế phải là: '+THUE.join(', ')+'.'};
  if(!ky) return {ok:false, error:'Thiếu kỳ kê khai.'};
  if(TT_KHAI.indexOf(trangThai)<0) return {ok:false, error:'Trạng thái không hợp lệ.'};
  if(soTien<0) return {ok:false, error:'Số tiền thuế không được âm.'};
  await db.prepare(
    'INSERT INTO ketToanToKhai (loai,ky,soTien,trangThai,hanNop,nguoiKhai,ghiLuc) VALUES (?,?,?,?,?,?,?) '+
    'ON CONFLICT(loai,ky) DO UPDATE SET soTien=excluded.soTien, trangThai=excluded.trangThai, '+
    'hanNop=excluded.hanNop, nguoiKhai=excluded.nguoiKhai, ghiLuc=excluded.ghiLuc'
  ).bind(loai, ky, soTien, trangThai, String(y.hanNop||'').slice(0,40)||null, hoSo.u, new Date().toISOString()).run();
  await Kho.ghiNhatKy(db, {uid:hoSo.uid, username:hoSo.u, viec:'KT_TOKHAI',
    doiTuong:loai+' '+ky, chiTiet:trangThai+' · '+soTien+'đ'});
  return {ok:true, loai, ky, trangThai};
}

export async function docToKhai(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const rs = await db.prepare(
    'SELECT loai,ky,soTien,trangThai,hanNop FROM ketToanToKhai ORDER BY ghiLuc DESC, rowid DESC LIMIT 100').all();
  const ds = (rs && rs.results) || [];
  return {ok:true, ds, chuaNop: ds.filter(x=>x.trangThai!=='daNop').length};
}

/* ── BUỒNG LÁI + BÁO CÁO — đọc từ sổ ── */
async function tong(db, sql, ...b){ const r = await db.prepare(sql).bind(...b).first(); return (r && r.v) || 0; }
export async function docBuongLaiKT(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const dt = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkCo='511'");
  const cp = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkNo LIKE '6%'");
  const gtgtRa = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkCo='3331'");
  const gtgtVao = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkNo='1331'");
  const hd = await db.prepare('SELECT COUNT(*) n FROM ketToanHoaDon WHERE daGhiSo=0').first();
  const tk = await db.prepare("SELECT COUNT(*) n FROM ketToanToKhai WHERE trangThai!='daNop'").first();
  return {ok:true,
    doanhThu:dt, chiPhi:cp, loiNhuan:dt-cp,
    gtgtPhaiNop: Math.max(0, gtgtRa-gtgtVao),
    hoaDonChuaGhiSo: (hd&&hd.n)||0,
    toKhaiChuaNop: (tk&&tk.n)||0 };
}
export async function docBaoCaoTC(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const dt = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkCo='511'");
  const cp = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkNo LIKE '6%'");
  const truocThue = dt - cp;
  const tndn = Math.max(0, Math.round(truocThue * 0.2));
  return {ok:true, doanhThu:dt, chiPhi:cp, loiNhuanTruocThue:truocThue, tndn, loiNhuanSauThue:truocThue-tndn};
}

/* ═══════════════ BÁO CÁO CAO CẤP — đều ĐỌC từ sổ, không cột tổng ═══════════════
   Năm báo cáo một kế toán chuyên nghiệp cần, và cả năm DẪN XUẤT từ chính
   ketToanButToan / ketToanHoaDon — không bảng thứ hai, không số giả. Số cân
   đối là hệ quả của bút toán kép: mỗi bút toán +soTien vào dư tkNo và −soTien
   vào dư tkCo, nên Σ mọi dư = 0, và bảng cân đối luôn khớp khi sổ khớp. */

/* 1 · BẢNG CÂN ĐỐI SỐ PHÁT SINH (trial balance): phát sinh Nợ/Có + dư cuối. */
export async function docCanDoiPhatSinh(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const rs = await db.prepare('SELECT tkNo,tkCo,soTien FROM ketToanButToan').all();
  const rows = (rs && rs.results) || [];
  const psNo = {}, psCo = {};
  for(const r of rows){
    psNo[r.tkNo] = (psNo[r.tkNo]||0) + Number(r.soTien||0);
    psCo[r.tkCo] = (psCo[r.tkCo]||0) + Number(r.soTien||0);
  }
  const tks = Array.from(new Set(Object.keys(psNo).concat(Object.keys(psCo)))).sort();
  const tk = tks.map(k => {
    const pn = psNo[k]||0, pc = psCo[k]||0, du = pn - pc;
    return {tk:k, psNo:pn, psCo:pc, duNo: du>0?du:0, duCo: du<0?-du:0};
  });
  const tong = tk.reduce((a,x)=>({psNo:a.psNo+x.psNo, psCo:a.psCo+x.psCo,
    duNo:a.duNo+x.duNo, duCo:a.duCo+x.duCo}), {psNo:0,psCo:0,duNo:0,duCo:0});
  /* Chỉ canDoiDu là phép canh THẬT (Σ dư Nợ = Σ dư Có ⇔ Σ dư = 0). Tổng phát
     sinh Nợ = tổng phát sinh Có là tất yếu của bút toán kép — không khai một
     cờ luôn đúng, vì một phép canh không thể sai là một cái gương, không phải
     phép canh (luật 9.99.84). */
  return {ok:true, tk, tong, canDoiDu: tong.duNo===tong.duCo, soButToan: rows.length};
}

/* 2 · BẢNG CÂN ĐỐI KẾ TOÁN (balance sheet): Tài sản = Nguồn vốn. */
const TEN_LOAI = {'1':'Tài sản ngắn hạn','2':'Tài sản dài hạn',
  '3':'Nợ phải trả','4':'Vốn chủ sở hữu'};
export async function docCanDoiKeToan(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const rs = await db.prepare('SELECT tkNo,tkCo,soTien FROM ketToanButToan').all();
  const rows = (rs && rs.results) || [];
  const du = {};
  for(const r of rows){
    du[r.tkNo] = (du[r.tkNo]||0) + Number(r.soTien||0);
    du[r.tkCo] = (du[r.tkCo]||0) - Number(r.soTien||0);
  }
  let taiSan=0, noPhaiTra=0, vonCSH=0, doanhThu=0, chiPhi=0;
  const nhom = {taiSan:[], nguonVon:[]};
  for(const k of Object.keys(du).sort()){
    const d = du[k], c = k.charAt(0);
    if(c==='1' || c==='2'){ if(d!==0){ taiSan += d; nhom.taiSan.push({tk:k, du:d, loai:TEN_LOAI[c]}); } }
    else if(c==='3'){ if(d!==0){ noPhaiTra += -d; nhom.nguonVon.push({tk:k, du:-d, loai:TEN_LOAI['3']}); } }
    else if(c==='4'){ if(d!==0){ vonCSH += -d; nhom.nguonVon.push({tk:k, du:-d, loai:TEN_LOAI['4']}); } }
    else if(c==='5' || c==='7'){ doanhThu += -d; }
    else if(c==='6' || c==='8'){ chiPhi += d; }
  }
  const lnChuaPP = doanhThu - chiPhi;
  const tongNguonVon = noPhaiTra + vonCSH + lnChuaPP;
  return {ok:true, tongTaiSan:taiSan, noPhaiTra, vonCSH, lnChuaPP, tongNguonVon,
    canDoi: taiSan===tongNguonVon, nhom,
    vi:'Bảng cân đối kế toán dẫn từ sổ. Lợi nhuận chưa phân phối = doanh thu − chi phí, '+
       'cộng vào nguồn vốn. Tài sản luôn = Nguồn vốn khi sổ cân (bút toán kép bảo đảm).'};
}

/* 3 · ĐỐI CHIẾU THUẾ GTGT theo kỳ tháng: đầu ra (3331) − đầu vào (1331). */
export async function docDoiChieuGTGT(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const ra = await db.prepare("SELECT substr(ngay,1,7) ky, SUM(soTien) v FROM ketToanButToan WHERE tkCo='3331' GROUP BY substr(ngay,1,7)").all();
  const vao = await db.prepare("SELECT substr(ngay,1,7) ky, SUM(soTien) v FROM ketToanButToan WHERE tkNo='1331' GROUP BY substr(ngay,1,7)").all();
  const m = {};
  (ra.results||[]).forEach(r=>{ m[r.ky] = m[r.ky] || {ky:r.ky,dauRa:0,dauVao:0}; m[r.ky].dauRa = Number(r.v||0); });
  (vao.results||[]).forEach(r=>{ m[r.ky] = m[r.ky] || {ky:r.ky,dauRa:0,dauVao:0}; m[r.ky].dauVao = Number(r.v||0); });
  const ky = Object.keys(m).sort().map(k=>{
    const o = m[k], chenh = o.dauRa - o.dauVao;
    return {ky:o.ky, dauRa:o.dauRa, dauVao:o.dauVao,
      phaiNop: chenh>0?chenh:0, khauTruChuyenKy: chenh<0?-chenh:0};
  });
  const tong = ky.reduce((a,x)=>({dauRa:a.dauRa+x.dauRa, dauVao:a.dauVao+x.dauVao,
    phaiNop:a.phaiNop+x.phaiNop, khauTruChuyenKy:a.khauTruChuyenKy+x.khauTruChuyenKy}),
    {dauRa:0,dauVao:0,phaiNop:0,khauTruChuyenKy:0});
  return {ok:true, ky, tong,
    vi:'GTGT phải nộp từng kỳ = đầu ra (3331) − đầu vào được khấu trừ (1331). '+
       'Kỳ nào đầu vào lớn hơn thì phần dư chuyển khấu trừ sang kỳ sau.'};
}

/* 4 · LƯU CHUYỂN TIỀN TỆ: tiền vào/ra qua 111·112, theo tháng. */
export async function docLuuChuyenTien(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  /* Chỉ đếm dòng tiền THẬT ra/vào — bỏ chuyển nội bộ (rút quỹ ↔ ngân hàng,
     cả hai đầu đều 111/112) kẻo thổi gấp đôi cả vào lẫn ra (thuần vẫn 0 nhưng
     tổng gộp sai). */
  const vao = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkNo IN ('111','112') AND tkCo NOT IN ('111','112')");
  const ra  = await tong(db, "SELECT SUM(soTien) v FROM ketToanButToan WHERE tkCo IN ('111','112') AND tkNo NOT IN ('111','112')");
  const th = await db.prepare(
    "SELECT substr(ngay,1,7) ky, "+
    "SUM(CASE WHEN tkNo IN ('111','112') AND tkCo NOT IN ('111','112') THEN soTien ELSE 0 END) vao, "+
    "SUM(CASE WHEN tkCo IN ('111','112') AND tkNo NOT IN ('111','112') THEN soTien ELSE 0 END) ra "+
    "FROM ketToanButToan WHERE tkNo IN ('111','112') OR tkCo IN ('111','112') "+
    "GROUP BY substr(ngay,1,7) ORDER BY ky").all();
  const thang = (th.results||[]).map(r=>({ky:r.ky, vao:Number(r.vao||0),
    ra:Number(r.ra||0), thuan:Number(r.vao||0)-Number(r.ra||0)}));
  return {ok:true, tienVao:vao, tienRa:ra, thuan:vao-ra, thang,
    vi:'Dòng tiền qua quỹ (111) và ngân hàng (112). Thuần = vào − ra; '+
       'thuần âm kéo dài là dấu hiệu cạn tiền dù sổ vẫn có lãi.'};
}

/* 5 · CÔNG NỢ THEO TUỔI (aging): phải thu 131 · phải trả 331, theo ngày chứng từ. */
export async function docCongNoTuoi(y, env, db, hoSo){
  if(!gac(hoSo)) return chan();
  const homNay = new Date().toISOString().slice(0,10);
  const moc = Date.parse(homNay);
  async function aging(tk, chieu){
    const rs = await db.prepare(
      "SELECT ngay, "+
      "SUM(CASE WHEN tkNo=? THEN soTien ELSE 0 END) - SUM(CASE WHEN tkCo=? THEN soTien ELSE 0 END) net "+
      "FROM ketToanButToan WHERE tkNo=? OR tkCo=? GROUP BY ngay").bind(tk,tk,tk,tk).all();
    const b = {b0:0, b30:0, b60:0, b90:0};
    let t = 0;
    (rs.results||[]).forEach(r=>{
      let net = Number(r.net||0);
      if(chieu==='co') net = -net;      /* phải trả: dư CÓ = có − nợ */
      t += net;
      const age = Math.floor((moc - Date.parse(r.ngay)) / 864e5);
      if(age<=30) b.b0 += net; else if(age<=60) b.b30 += net;
      else if(age<=90) b.b60 += net; else b.b90 += net;
    });
    return {tong:t, b0:b.b0, b30:b.b30, b60:b.b60, b90:b.b90};
  }
  const phaiThu = await aging('131','no');
  const phaiTra = await aging('331','co');
  return {ok:true, homNay, phaiThu, phaiTra,
    vi:'Xếp tuổi nợ theo NGÀY CHỨNG TỪ (chưa khớp thanh toán từng hoá đơn). '+
       'Nhóm quá 90 ngày là nợ cần đòi/thu xếp gấp — để lâu là rủi ro mất vốn.'};
}
