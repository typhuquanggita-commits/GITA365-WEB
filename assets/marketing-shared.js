/* ═══════════════════════════════════════════════════════════════
   GITA 365 · SHARED MARKETING JS
   Được nạp bởi các trang marketing tĩnh: i18n, menu điện thoại, câu hỏi
   thường gặp, form liên hệ, và ĐO HÀNH VI về máy chủ của Học viện.

   Đo hành vi (cửa ghiLuotTrang, may-chu/do-trang.js) — ba luật:
   · Gửi về Worker của Học viện, không gắn mã đo của bên thứ ba nào.
   · Không cookie, không mã người xem. Mỗi tín hiệu chỉ là (trang · việc ·
     nhãn nút · nguồn · loại máy); máy chủ cộng một vào ô đếm rồi thôi.
   · Trình duyệt bật "Do Not Track" / "Global Privacy Control" thì KHÔNG
     gửi gì — người đã nói không muốn bị đo thì không đo.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function(){
  /* Một địa chỉ máy chủ cho cả trang: form và tín hiệu đo dùng chung. */
  var MAY_CHU = 'https://gita365.typhuquanggita.workers.dev/';
  window.MK_RENDER = window.MK_RENDER || function(){};
  function M(k, mac){ var v = window.G && G.M ? G.M(k) : k; return v && v !== k ? v : mac; }

  function render(){
    if(!window.G || !window.G.M) return;
    document.querySelectorAll('[data-m]').forEach(function(el){
      var k = el.getAttribute('data-m');
      if(!k) return;
      if(k === 'heroH1'){
        el.innerHTML = G.M('heroH1a') + ' <em>' + G.M('heroH1b') + '</em> ' + G.M('heroH1c');
        return;
      }
      var v = G.M(k);
      if(v !== k) el.textContent = v;
    });
    document.querySelectorAll('[data-m-placeholder]').forEach(function(el){
      var k = el.getAttribute('data-m-placeholder');
      var v = G.M(k);
      if(v !== k) el.setAttribute('placeholder', v);
    });
    document.documentElement.lang = (window.G && window.G.MK_LANG === 'en') ? 'en' : 'vi';
    var og = document.querySelector('meta[property="og:locale"]');
    if(og && window.G && window.G.MK_LANG) og.setAttribute('content', G.MK_LANG === 'en' ? 'en_US' : 'vi_VN');
    document.querySelectorAll('.m-lang button').forEach(function(b){
      var on = window.G && b.getAttribute('data-lang') === G.MK_LANG;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  window.MK_RENDER = render;

  /* ─────────── ĐO HÀNH VI ─────────── */
  var TRANG = { landing:1, 've-chung-toi':1, 'dich-vu':1, 'bang-gia':1, 'lien-he':1, 'cau-hoi-thuong-gap':1 };
  function trangNay(){
    var p = (location.pathname.split('/').pop() || 'landing').replace(/\.html$/, '');
    return TRANG[p] ? p : 'khac';
  }
  function nguonNay(){
    var utm = '';
    try { utm = (new URLSearchParams(location.search).get('utm_source') || '').toLowerCase(); } catch(e){}
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch(e){}
    var s = utm || ref;
    if(!s) return 'truc-tiep';
    if(ref && ref === location.hostname && !utm) return 'noi-bo';
    if(/google/.test(s)) return 'google';
    if(/facebook|fb\.|^fb$|messenger|instagram/.test(s)) return 'facebook';
    if(/zalo/.test(s)) return 'zalo';
    if(/youtube|youtu\.be/.test(s)) return 'youtube';
    if(/tiktok/.test(s)) return 'tiktok';
    return 'khac';
  }
  function choDo(){
    try {
      if(navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return false;
    } catch(e){}
    /* Máy phát triển không đếm vào số thật — trừ khi bộ thử bật cờ. */
    if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !window.MK_DO_LUON) return false;
    return true;
  }
  var NGUON = nguonNay(), MAY = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || innerWidth < 768 ? 'dt' : 'may';
  var DA_GUI = {};
  function do_(su, nhan, motLan){
    if(!choDo()) return;
    var khoa = su + '|' + (nhan || '');
    if(motLan && DA_GUI[khoa]) return;
    DA_GUI[khoa] = 1;
    var than = JSON.stringify({ fn:'ghiLuotTrang', trang: trangNay(), su: su, nhan: nhan || '', nguon: NGUON, may: MAY });
    try {
      /* text/plain là "yêu cầu đơn giản": không cần hỏi trước CORS, và
         sendBeacon vẫn đi được khi người xem rời trang ngay sau khi bấm. */
      if(navigator.sendBeacon && navigator.sendBeacon(MAY_CHU, new Blob([than], { type:'text/plain' }))) return;
    } catch(e){}
    try { fetch(MAY_CHU, { method:'POST', body: than, keepalive: true, headers:{ 'Content-Type':'text/plain' } }); } catch(e){}
  }
  window.MK_DO = do_;

  function batDauDo(){
    do_('xem');
    try {
      if(!sessionStorage.getItem('gita365.mk.phien')){ sessionStorage.setItem('gita365.mk.phien', '1'); do_('phienMoi'); }
    } catch(e){ do_('phienMoi', '', true); }
    var cuon = function(){
      var h = document.documentElement, du = (h.scrollTop + innerHeight) / Math.max(1, h.scrollHeight);
      if(du >= .5) do_('cuon50', '', true);
      if(du >= .9){ do_('cuon90', '', true); removeEventListener('scroll', cuon); }
    };
    addEventListener('scroll', cuon, { passive: true });
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a,button');
      if(!a) return;
      var href = a.getAttribute('href') || '';
      if(/^tel:/.test(href)) return do_('goiDien', a.closest('.m-dock') ? 'dock' : '');
      if(a.hasAttribute('data-do')) do_('bamCta', String(a.getAttribute('data-do')).slice(0, 32));
      if(/(^|\/)index\.html/.test(href)) do_('moUngDung');
      if(a.hasAttribute('data-lang')) do_('doiNgonNgu', a.getAttribute('data-lang') === 'en' ? 'en' : 'vi');
    }, true);
  }

  function init(){
    // Language switcher
    document.querySelectorAll('.m-lang button').forEach(function(b){
      b.addEventListener('click', function(){
        if(window.G && window.G.setMkLang) G.setMkLang(b.getAttribute('data-lang'));
      });
    });

    // Mobile menu
    var menuBtn = document.querySelector('.m-menu-btn');
    var navLinks = document.getElementById('navLinks');
    if(menuBtn && navLinks){
      var dat = function(mo){
        navLinks.classList.toggle('open', mo);
        menuBtn.setAttribute('aria-expanded', mo ? 'true' : 'false');
        menuBtn.textContent = mo ? '✕' : '☰';
      };
      menuBtn.addEventListener('click', function(){ dat(!navLinks.classList.contains('open')); });
      navLinks.addEventListener('click', function(e){ if(e.target.closest('a')) dat(false); });
      document.addEventListener('keydown', function(e){ if(e.key === 'Escape') dat(false); });
    }

    // FAQ — nút thật (button) nên bàn phím và trình đọc màn hình dùng được.
    document.querySelectorAll('.m-faq-q').forEach(function(q){
      var item = q.parentElement;
      q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      q.addEventListener('click', function(){
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.m-faq-item').forEach(function(i){
          i.classList.remove('open');
          var b = i.querySelector('.m-faq-q'); if(b) b.setAttribute('aria-expanded', 'false');
        });
        if(!wasOpen){ item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); do_('faqMo'); }
      });
    });

    // Contact form
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');
    if(form && status){
      form.addEventListener('focusin', function(){ do_('moForm', '', true); });
      form.addEventListener('submit', function(e){
        e.preventDefault();
        /* Gửi về Worker của Học viện (cửa guiLienHe) — không qua dịch vụ ngoài.
           Máy chủ tự soát mọi ô; ở đây chỉ gom và báo lại đúng lời máy chủ nói. */
        var o = { fn:'guiLienHe' };
        ['name','phone','email','topic','message','website'].forEach(function(k){
          var el = form.elements[k]; o[k] = el ? String(el.value || '') : '';
        });
        var nut = form.querySelector('button[type="submit"]');
        if(nut) nut.disabled = true;
        status.textContent = M('formSending', 'Đang gửi…');
        status.removeAttribute('data-tt');
        do_('guiForm');
        fetch(form.getAttribute('data-may-chu') || MAY_CHU, { method:'POST', body: JSON.stringify(o),
          headers:{ 'Content-Type':'application/json' } })
          .then(function(r){ return r.json(); })
          .then(function(kq){
            if(kq && kq.ok){
              form.reset();
              status.textContent = M('formOk', 'Học viện đã nhận yêu cầu của bạn. Tư vấn sẽ gọi lại trong 24 giờ làm việc.');
              status.setAttribute('data-tt', 'ok');
              do_('guiFormOk');
            } else {
              status.textContent = (kq && kq.error) || M('formFail', 'Chưa gửi được. Bạn gọi 08.5555.4688 giúp Học viện nhé.');
              status.setAttribute('data-tt', 'loi');
              do_('guiFormLoi');
            }
          })
          .catch(function(){
            status.textContent = M('formFail', 'Chưa gửi được. Bạn gọi 08.5555.4688 giúp Học viện nhé.');
            status.setAttribute('data-tt', 'loi');
            do_('guiFormLoi');
          })
          .then(function(){ if(nut) nut.disabled = false; });
      });
    }

    render();
    batDauDo();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
