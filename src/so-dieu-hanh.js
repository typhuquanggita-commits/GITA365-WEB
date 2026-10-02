/* Sổ điều hành R01/R02: biến sự cố và thay đổi thành việc có chủ, duyệt, bằng chứng. */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U=G.U, h=U.h, ic=U.ic; G.VIEWS=G.VIEWS||{};
  var KIND={suCo:'Sự cố',phatHanh:'Phát hành',caiTien:'Cải tiến'};
  var STATUS={moi:'Mới',dangLam:'Đang làm',choDuyet:'Chờ duyệt',dong:'Đã đóng'};
  function ok(){ var r=(G.S&&G.S.acc&&G.S.acc.role)||''; return r==='R01'||r==='R02'; }
  function load(){
    var box=document.getElementById('sdhList'); if(box) box.innerHTML='<p class="sm dim">Đang đọc sổ vận hành…</p>';
    G.goiMayChu('docSoVanHanh').then(function(d){
      if(!box) return;
      if(!d.ok){ box.innerHTML='<p class="sm" style="color:var(--gita-do-ink)">'+h(d.error||'Không đọc được sổ.')+'</p>'; return; }
      draw(d.items||[]);
    });
  }
  function draw(items){
    var box=document.getElementById('sdhList'); if(!box)return;
    if(!items.length){box.innerHTML='<p class="sm dim">Chưa có việc điều hành. Chỉ ghi việc có người chịu trách nhiệm.</p>';return;}
    box.innerHTML=items.map(function(x){
      var c=x.status==='dong'?'var(--ok)':x.kind==='suCo'?'var(--gita-do)':'var(--gita)';
      return '<div class="card mt" style="border-left:3px solid '+c+'"><div class="row wrap" style="gap:8px"><b style="flex:1">'+h(x.title)+'</b>'+
        U.chip(KIND[x.kind]||x.kind,c)+U.chip(STATUS[x.status]||x.status,c)+'</div>'+
        '<p class="sm dim mt">Chủ việc: <b>'+h(x.owner)+'</b> · tạo '+h(String(x.createdAt||'').slice(0,16).replace('T',' '))+'</p>'+
        (x.ref?'<p class="tiny muted mt">Tham chiếu: '+h(x.ref)+'</p>':'')+
        (x.rollbackRef?'<p class="tiny muted mt">Lùi: '+h(x.rollbackRef)+'</p>':'')+
        (x.evidence?'<p class="sm mt">Kết quả: '+h(x.evidence)+'</p>':'')+
        (x.status!=='dong'?'<button class="btn ghost sm mt" data-act="sdh-update" data-id="'+h(x.id)+'">Cập nhật / duyệt</button>':'')+'</div>';
    }).join('');
  }
  function val(id){var e=document.getElementById(id);return e?String(e.value||'').trim():'';}
  G.VIEWS['so-dieu-hanh']=function(){
    if(!ok()) return U.lockCard('Sổ điều hành chỉ dành cho Super Admin và Admin hệ thống.');
    var o=U.ph({eyebrow:'VẬN HÀNH NỘI BỘ · R01 – R02',ic:'orbit',grad:1,t:'Sổ điều hành',
      lead:'Mọi sự cố, phát hành và cải tiến có một chủ việc, bằng chứng, người duyệt và đường lùi. Sổ không tự deploy, migration hoặc sửa dữ liệu.'});
    o+='<div class="card"><div class="row wrap" style="gap:10px"><label>Loại <select id="sdhKind"><option value="suCo">Sự cố</option><option value="phatHanh">Phát hành</option><option value="caiTien">Cải tiến</option></select></label>'+
      '<label style="flex:2;min-width:220px">Việc cần làm <input id="sdhTitle" maxlength="160" placeholder="Mô tả ngắn, rõ kết quả cần đạt"></label>'+
      '<label>Người chịu trách nhiệm <input id="sdhOwner" maxlength="80" placeholder="Tên hoặc vai"></label></div>'+
      '<div class="row wrap mt" style="gap:10px"><label style="flex:1;min-width:220px">PR / commit / link tham chiếu <input id="sdhRef" maxlength="240" placeholder="Không nhập secret hoặc dữ liệu khách"></label>'+
      '<label style="flex:1;min-width:220px">Đường lùi / rollback <input id="sdhRollback" maxlength="240" placeholder="Commit, deployment hoặc SOP"></label>'+
      '<button class="btn pri" data-act="sdh-create">'+ic('plus','w-4 h-4')+'Ghi việc</button></div>'+
      '<p class="tiny muted mt">Không ghi token, secret, media hoặc dữ liệu khách vào sổ.</p></div><div id="sdhList" class="mt2"><p class="sm dim">Kết nối Worker để đọc sổ chung.</p></div>';
    setTimeout(load,0); return o;
  };
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;var a=b.getAttribute('data-act');
    if(a==='sdh-create'){
      G.goiMayChu('ghiSoVanHanh',{kind:val('sdhKind'),title:val('sdhTitle'),owner:val('sdhOwner'),ref:val('sdhRef'),rollbackRef:val('sdhRollback')}).then(function(d){
        U.toast(d.ok?'Đã ghi việc điều hành.':'Không ghi được: '+(d.error||''),d.ok?'ok':'err');if(d.ok)load();
      });
    }
    if(a==='sdh-update'){
      var status=prompt('Trạng thái: moi, dangLam, choDuyet, dong','dangLam');if(!status)return;
      var reviewer=prompt('Người duyệt / xác nhận','');if(reviewer===null)return;
      var evidence=prompt('Bằng chứng hoặc kết quả (ít nhất 10 ký tự khi chờ duyệt/đóng)','');if(evidence===null)return;
      G.goiMayChu('capNhatSoVanHanh',{id:b.getAttribute('data-id'),status:status,reviewer:reviewer,evidence:evidence}).then(function(d){
        U.toast(d.ok?'Đã cập nhật.':'Không cập nhật được: '+(d.error||''),d.ok?'ok':'err');if(d.ok)load();
      });
    }
  });
})();
