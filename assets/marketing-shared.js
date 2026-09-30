/* ═══════════════════════════════════════════════════════════════
   GITA 365 · SHARED MARKETING JS
   Được nạp bởi các trang marketing tĩnh: xử lý i18n, mobile nav,
   FAQ accordion, form contact, analytics nhẹ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function(){
  window.MK_RENDER = window.MK_RENDER || function(){};

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
      if(!k || !window.G || !window.G.M) return;
      var v = G.M(k);
      if(v !== k) el.setAttribute('placeholder', v);
    });
    document.documentElement.lang = (window.G && window.G.MK_LANG === 'en') ? 'en' : 'vi';
    var og = document.querySelector('meta[property="og:locale"]');
    if(og && window.G && window.G.MK_LANG) og.setAttribute('content', G.MK_LANG === 'en' ? 'en_US' : 'vi_VN');
    document.querySelectorAll('.m-lang button').forEach(function(b){
      b.classList.toggle('active', window.G && b.getAttribute('data-lang') === G.MK_LANG);
    });
  }
  window.MK_RENDER = render;

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
      menuBtn.addEventListener('click', function(){
        var open = navLinks.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.textContent = open ? '✕' : '☰';
      });
    }

    // FAQ accordion
    document.querySelectorAll('.m-faq-q').forEach(function(q){
      q.addEventListener('click', function(){
        var item = q.parentElement;
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.m-faq-item').forEach(function(i){ i.classList.remove('open'); });
        if(!wasOpen) item.classList.add('open');
      });
    });

    // Contact form
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');
    if(form && status){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var data = new FormData(form);
        fetch(form.action, {method:'POST', body:data, headers:{Accept:'application/json'}})
          .then(function(r){
            if(r.ok){
              form.reset();
              status.textContent = (window.G && G.MK_LANG==='en') ? 'Thank you. We will call you within 24 hours.' : 'Cảm ơn bạn. Chúng tôi sẽ gọi lại trong 24 giờ.';
              status.style.color = 'var(--ok)';
            }else{
              throw new Error('fail');
            }
          })
          .catch(function(){
            status.textContent = (window.G && G.MK_LANG==='en') ? 'Could not send. Please call 08.5555.4688.' : 'Gửi không thành công. Vui lòng gọi 08.5555.4688.';
            status.style.color = 'var(--gita-do)';
          });
      });
    }

    render();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
