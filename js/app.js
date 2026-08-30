/* Dobosh Bouwwerken — het gedrag dat op de originele site door React werd geregeld.
   Onderdelen: mobiel menu, infaden bij scrollen, projectenfilter, carousel en lightbox. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- mobiel menu */
  function initMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    var btn = document.querySelector('nav button[aria-label="Menu openen"]');
    if (!menu || !btn) return;

    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    });
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mobile-menu');
  }

  /* ------------------------------------------------------- infaden bij scrollen */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    function show(el) { el.classList.add('is-visible'); }
    function showAll() { Array.prototype.forEach.call(items, show); }

    // Vangnet: de tekst mag nooit onzichtbaar blijven staan. Lukt het infaden
    // niet (geen IntersectionObserver, of een browser die geen callbacks geeft),
    // dan valt hij terug op scrollen en uiteindelijk op "gewoon alles tonen".
    if (!('IntersectionObserver' in window)) { fallback(); return; }

    var revealed = 0;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          show(e.target);
          revealed++;
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });

    // Heeft de observer na 1,2 s niets gedaan terwijl er wel iets in beeld staat,
    // dan doet hij het niet en nemen we het zelf over.
    window.setTimeout(function () {
      if (revealed === 0 && inViewport(items[0])) { io.disconnect(); fallback(); }
    }, 1200);

    function inViewport(el) {
      if (!el) return false;
      var r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || 0) && r.bottom > 0;
    }

    function fallback() {
      function check() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        Array.prototype.forEach.call(items, function (el) {
          if (el.classList.contains('is-visible')) return;
          if (el.getBoundingClientRect().top < vh * 0.95) show(el);
        });
      }
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
      check();
      // laatste redmiddel: na 5 s staat er sowieso niets meer verstopt
      window.setTimeout(showAll, 5000);
    }
  }

  /* ------------------------------------------------------------ projectenfilter */
  var FILTER_ON = 'px-5 py-2.5 text-sm font-medium rounded-sm transition-all duration-300 bg-[#0F172A] text-[#FACC15]';
  var FILTER_OFF = 'px-5 py-2.5 text-sm font-medium rounded-sm transition-all duration-300 bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#FACC15] hover:text-[#0F172A]';

  function initFilters() {
    // de filterknoppen staan bij elkaar; herken ze aan hun klasse
    var buttons = Array.prototype.filter.call(
      document.querySelectorAll('button'),
      function (b) { return b.className.indexOf('px-5 py-2.5 text-sm font-medium rounded-sm') === 0; }
    );
    if (!buttons.length) return;

    // elke kaart met een afbeelding krijgt zijn categorie uit de alt-tekst
    var cards = document.querySelectorAll('div.group.bg-white.rounded-sm');
    cards.forEach(function (card) {
      var img = card.querySelector('img');
      if (!img) return;
      var cat = (img.getAttribute('alt') || '').replace(/\s*\d+\s*$/, '').trim();
      card.setAttribute('data-project-card', '');
      card.setAttribute('data-category', cat.toLowerCase());
    });

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = (btn.textContent || '').trim();
        var want = label.toLowerCase();

        buttons.forEach(function (b) { b.className = (b === btn) ? FILTER_ON : FILTER_OFF; });

        document.querySelectorAll('[data-project-card]').forEach(function (card) {
          var cat = card.getAttribute('data-category') || '';
          // "Badkamer" moet ook "Badkamer Renovatie" tonen
          var show = (want === 'alle') || cat === want || cat.indexOf(want) === 0;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* -------------------------------------------------------------------- carousel */
  var DOT_ON = 'w-1.5 h-1.5 rounded-full transition-colors bg-[#FACC15]';
  var DOT_OFF = 'w-1.5 h-1.5 rounded-full transition-colors bg-white/60';

  function initCarousels() {
    document.querySelectorAll('[data-slides]').forEach(function (box) {
      var slides = (box.getAttribute('data-slides') || '').split('|').filter(Boolean);
      if (slides.length < 2) return;

      var img = box.querySelector('img');
      var btns = box.querySelectorAll('button');
      var dots = box.querySelectorAll('.absolute.bottom-2 > div');
      var idx = 0;

      function show(n) {
        idx = (n + slides.length) % slides.length;
        img.setAttribute('src', slides[idx]);
        dots.forEach(function (d, i) { d.className = (i === idx) ? DOT_ON : DOT_OFF; });
      }

      if (btns[0]) btns[0].addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
      if (btns[1]) btns[1].addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    });
  }

  /* -------------------------------------------------------------------- lightbox */
  function initLightbox() {
    var boxes = document.querySelectorAll('div.relative.overflow-hidden.cursor-pointer');
    if (!boxes.length) return;

    var overlay = null;

    function close() {
      if (!overlay) return;
      overlay.remove();
      overlay = null;
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    }

    function onKey(e) { if (e.key === 'Escape') close(); }

    function open(src, alt) {
      close();
      overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4';

      var img = document.createElement('img');
      img.className = 'max-w-full max-h-full object-contain rounded-sm';
      img.src = src;
      img.alt = alt || '';

      var btn = document.createElement('button');
      btn.className = 'absolute top-6 right-6 text-white text-3xl leading-none hover:text-[#FACC15] transition-colors';
      btn.setAttribute('aria-label', 'Sluiten');
      btn.textContent = '✕';

      overlay.appendChild(img);
      overlay.appendChild(btn);
      overlay.addEventListener('click', close);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
    }

    boxes.forEach(function (box) {
      box.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;   // pijltjes van de carousel niet
        var img = box.querySelector('img');
        if (img) open(img.getAttribute('src'), img.getAttribute('alt'));
      });
    });
  }

  /* ------------------------------------------------------ lopende band met reviews */
  function initReviewsMarquee() {
    var wrap = document.querySelector('.reviews-marquee');
    if (!wrap) return;
    var track = wrap.querySelector('.reviews-track');
    if (!track || !track.children.length) return;

    var cards = Array.prototype.slice.call(track.children);

    // breedte van één set meten vóór het dupliceren
    var setWidth = track.scrollWidth;
    if (!setWidth) return;

    // set verdubbelen, zodat de band naadloos kan rondlopen: op -50% staat
    // de kopie precies waar het origineel begon
    cards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    // snelheid gelijk houden, ongeacht het aantal reviews
    var pixelsPerSeconde = 60;
    track.style.setProperty('--reviews-duration', Math.round(setWidth / pixelsPerSeconde) + 's');
    track.classList.add('is-looping');
  }

  /* ------------------------------------------------------------------------ start */
  function init() {
    initMobileMenu();
    initReviewsMarquee();
    initFilters();
    initCarousels();
    initLightbox();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
