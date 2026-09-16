/* ═══════════════════════════════════════════════════════════════
   GITA 365 — GIẢ LẬP APPS SCRIPT, DÙNG CHUNG

   Apps Script không chạy được ở máy: không có trình chạy, không có
   bước gỡ lỗi tử tế, và mỗi lần sai là sửa thẳng trên bản đang phục
   vụ người thật. Nên mã máy chủ được soi ở đây trước.

   VÌ SAO TÁCH RA THÀNH MỘT MÔ-ĐUN

   Bản giả lập này trước nằm gọn trong tools/thu-may-chu.js. Tới lúc
   cần bộ đo tải (tools/do-tai-may-chu.js) thì có hai đường: chép bản
   giả lập sang tệp thứ hai, hoặc tách ra dùng chung. Chép thì hai bản
   sẽ lệch nhau — và ngày chúng lệch, bộ thử nói máy chủ đúng còn bộ
   đo nói máy chủ sai, mà không ai biết bản nào đang nói thật.

   BỘ ĐẾM

   Trang tính thật tính tiền bằng SỐ Ô ĐỌC và SỐ LƯỢT GỌI API, không
   tính bằng giây ở máy này. Nên bản giả lập đếm đúng hai thứ ấy: một
   con số đo được ở máy mà vẫn nói đúng về máy thật. Đếm luôn bật —
   chi phí một phép cộng, và một bộ đếm phải bật bằng tay là bộ đếm
   sẽ tắt vào đúng hôm cần nó.

   CÁCH DÙNG

       const gl = require('./gia-lap-apps-script')();
       for (const f of gl.dsGs()) eval(fs.readFileSync('server/' + f, 'utf8'));

   eval PHẢI nằm ở bên gọi, không nằm trong mô-đun này: mã .gs khai
   hàm ra phạm vi chứa nó, nên eval trong mô-đun thì hàm máy chủ nằm
   lại trong mô-đun và bên gọi không thấy gì. Đây không phải chuyện
   sạch mã — chuyển eval vào đây là cả bộ thử ngừng chạy.
   ═══════════════════════════════════════════════════════════════ */
/* Cố ý KHÔNG bật 'use strict': mã Apps Script được nạp bằng eval và cần
   khai báo hàm ra phạm vi chung, đúng như cách Apps Script nạp các tệp .gs. */
const fs = require('fs');

module.exports = function dungGiaLap() {
const fs = require('fs'), crypto = require('crypto');
const props={}, cache={};
let thu=[];
global.PropertiesService={getScriptProperties:()=>({
  getProperty:k=>props[k]===undefined?null:props[k], setProperty:(k,v)=>{props[k]=String(v);}})};
global.CacheService={getScriptCache:()=>({
  get:k=>cache[k]===undefined?null:cache[k], put:(k,v)=>{cache[k]=String(v);}, remove:k=>{delete cache[k];}})};
global.Utilities={
  getUuid:()=>crypto.randomUUID(),
  DigestAlgorithm:{SHA_256:'SHA-256'}, Charset:{UTF_8:'utf8'},
  computeDigest:(a,s)=>Array.from(crypto.createHash('sha256').update(s,'utf8').digest())
    .map(b=>b>127?b-256:b),
  base64Encode:by=>Buffer.from(by.map?by.map(x=>x<0?x+256:x):by).toString('base64'),
  base64Decode:t2=>Array.from(Buffer.from(t2,'base64')).map(b=>b>127?b-256:b),
  newBlob:(by,kieu,ten)=>({_by:by,_kieu:kieu,getName:()=>ten}),
  formatDate:(d,tz,f)=>new Date(d).toISOString()
};
global.MailApp={sendEmail:(to,cd,than)=>{thu.push({to,cd,than});}};
global.Logger={log:()=>{}};
global.ContentService={createTextOutput:t=>({setMimeType:()=>({_:t}),_:t}),MimeType:{JSON:'json'}};
/* Drive giả lập: bốn thư mục có thật, và một cái CỐ TÌNH chỉ cho xem —
   để bộ kiểm chứng minh nó phát hiện được thư mục không ghi được, chứ không
   phải chỉ báo xanh vì mọi thứ đều dễ. */
const thuMuc = {
  '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU': {ten:'Dữ Liệu GITA365', ghiDuoc:true, tep:[]},
  '1jVOnIH7286glI95fC4aqfXApecxEj7Xz': {ten:'Mã máy chủ GITA365', ghiDuoc:true, tep:[]}
};
global.MimeType={PLAIN_TEXT:'text/plain'};
/* Khoá ghi giả — ĐẾM lượt lấy khoá, để phép đo chứng minh được rằng
   thêm dòng và xoá dòng THẬT SỰ đi qua khoá, chứ không chỉ khai là có. */
global.GIA_LAP_KHOA = {lay:0, tra:0, hong:false};
global.LockService={getScriptLock:()=>({
  waitLock:()=>{ if(global.GIA_LAP_KHOA.hong) throw new Error('hết giờ chờ khoá');
                 global.GIA_LAP_KHOA.lay++; return true; },
  releaseLock:()=>{ global.GIA_LAP_KHOA.tra++; }})};
global.HtmlService={
  XFrameOptionsMode:{ALLOWALL:'ALLOWALL'},
  createHtmlOutput:h2=>({_:h2, setTitle(){return this;}, addMetaTag(){return this;},
    setXFrameOptionsMode(){return this;}})
};
global.GIA_LAP_TRIGGER=[];
global.ScriptApp={
  getService:()=>({getUrl:()=>'https://script.google.com/macros/s/GIA-LAP/exec'}),
  getProjectTriggers:()=>global.GIA_LAP_TRIGGER.slice(),
  deleteTrigger:t=>{const i=global.GIA_LAP_TRIGGER.indexOf(t); if(i>=0) global.GIA_LAP_TRIGGER.splice(i,1);},
  newTrigger:fn=>({timeBased:()=>({atHour:()=>({everyDays:()=>({
    create:()=>{const t={getHandlerFunction:()=>fn}; global.GIA_LAP_TRIGGER.push(t); return t;}})})})})
};
global.Session={getEffectiveUser:()=>({getEmail:()=>'typhuquanggita@gmail.com'})};
function moThuMuc(id){ return global.DriveApp.getFolderById(id); }
global.DriveApp={
  getFolderById:id=>{
    const t=thuMuc[id];
    if(!t) throw new Error('Không tìm thấy thư mục: '+id);
    return {
      getName:()=>t.ten,
      addFile:()=>{},
      getFilesByName:ten=>{
        const f=(t.kho||{})[ten];
        let da=false;
        return {hasNext:()=>!!f&&!da, next:()=>{da=true; return {
          getName:()=>ten,
          getBlob:()=>({getDataAsString:()=>f, getBytes:()=>Array.from(Buffer.from(f))})
        };}};
      },
      createFile:(a1,noi)=>{
        if(!t.ghiDuoc) throw new Error('Không có quyền ghi');
        const ten=typeof a1==='string'?a1:(a1&&a1.getName?a1.getName():'blob');
        const f={ten, bo:false, id:'DRV-'+(t.tep.length+1)};
        t.tep.push(f);
        return {setTrashed:v=>{f.bo=v;}, getName:()=>ten, getId:()=>f.id,
                setDescription:()=>{}};
      },
      getFoldersByName:n2=>{
        t.con=t.con||{};
        let da=false;
        return {hasNext:()=>!!t.con[n2]&&!da, next:()=>{da=true; return moThuMuc(t.con[n2]);}};
      },
      createFolder:n2=>{
        t.con=t.con||{};
        const idCon='SUB-'+n2+'-'+Math.random().toString(36).slice(2,7);
        thuMuc[idCon]={ten:n2, ghiDuoc:true, tep:[]};
        t.con[n2]=idCon;
        return moThuMuc(idCon);
      }
    };
  },
  getFileById:()=>({})
};
global.__thuMuc=thuMuc;

/* Bảng tính giả: mỗi trang là một mảng hàng */
const trang={};
/* Đếm theo ĐƠN VỊ TÍNH TIỀN CỦA SHEETS, không theo giây của máy này:
   ô đọc, ô ghi, và số lượt gọi API bảng tính. */
const dem={oDoc:0, oGhi:0, goi:0, docCaTrang:0, themDong:0, xoaDong:0};
function demO(hang){ let n=0; for(const h of hang) n += (h?h.length:0); return n; }
function moTrang(ten){
  if(!trang[ten]) trang[ten]=[];
  const t=trang[ten];
  return {
    getName:()=>ten,
    appendRow:h=>{ dem.goi++; dem.themDong++; dem.oGhi += h.length; t.push(h.slice()); },
    /* Sheets đánh số dòng từ 1. Xoá dòng 5 làm dòng 6 thành dòng 5 —
       bộ giả lập phải cư xử ĐÚNG như thế, không thì phép đo "xoá từ
       dưới lên" của Store không chứng minh được gì. */
    deleteRow:d=>{ dem.goi++; dem.xoaDong++; t.splice(d-1,1); },
    deleteRows:(d,n)=>{ dem.goi++; dem.xoaDong+=(n||1); t.splice(d-1,n||1); },
    getDataRange:()=>({getValues:()=>{
      dem.goi++; dem.docCaTrang++; dem.oDoc += demO(t);
      return t.map(r=>r.slice());
    }}),
    getLastRow:()=>{ dem.goi++; return t.length; },
    getLastColumn:()=>t.length?t[0].length:0,
    setFrozenRows:()=>{},
    getRange:(d,c,nr,nc)=>({
      getValues:()=>{
        dem.goi++;
        const ra=[];
        for(let i=0;i<(nr||1);i++){
          const h=t[d-1+i]||[];
          ra.push(h.slice(c-1, c-1+(nc||h.length)));
        }
        dem.oDoc += demO(ra);
        return ra;
      },
      setValues:v=>{
        dem.goi++; dem.oGhi += demO(v);
        for(let i=0;i<v.length;i++){
          const h=t[d-1+i]||(t[d-1+i]=[]);
          for(let j=0;j<v[i].length;j++) h[c-1+j]=v[i][j];
        }
      }
    })
  };
}
const so={
  getId:()=>'SO-GIA-LAP',
  getSheetByName:n=>trang[n]?moTrang(n):null,
  insertSheet:n=>{trang[n]=[];return moTrang(n);},
  getSheets:()=>Object.keys(trang).map(moTrang),
  deleteSheet:s=>{delete trang[s.getName()];}
};
global.SpreadsheetApp={create:()=>so, openById:()=>so};


/* ── BỘ ĐẾM Ô ────────────────────────────────────────────────────
   getDataRange().getValues() đọc CẢ TRANG. Ở máy này nó là một phép
   map trên mảng, gần như không tốn gì; trên Sheets thật nó là toàn bộ
   chi phí của một lượt gọi. Đếm ô làm cho cái giá ấy nhìn thấy được
   ngay tại máy. */
function demLai() { for (const k in dem) dem[k] = 0; }

/* Tệp .gs nào cần nạp, theo đúng thứ tự bộ thử vẫn dùng: nền trước,
   rồi A–Z. ĐỌC THƯ MỤC, không khai tay — xem chú giải cùng tên ở
   tools/thu-may-chu.js và tools/gop-may-chu.js. */
function dsGs(goc) {
  return ['GITA_Nen.gs'].concat(
    fs.readdirSync(goc || 'server').filter(f =>
      /\.gs$/.test(f) && f !== 'GITA_Nen.gs' && f !== 'GITA365_TATCA.gs').sort());
}

return {
  props: props, cache: cache, trang: trang, dem: dem,
  thu: () => thu, xoaThu: () => { thu = []; },
  demLai: demLai, dsGs: dsGs, thuMuc: thuMuc
};
};
