/* ═══════════════════════════════════════════════════════════
   Sarki lebegő ULTIMA-maszk — kurzorkövető dőlés + LED-derengés

   A maszk a kurzor felé fordul, ha az a közelébe ér, és közben a
   négy validált hullámhossz színe úszik át mögötte. Érintésre és
   prefers-reduced-motion mellett nem indul el: ott marad a CSS-ben
   definiált lebegés és hover-billenés.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var fm = document.getElementById('floatMask');
  if (!fm) return;

  var btn = fm.querySelector('.float-mask-btn');
  var img = fm.querySelector('.float-mask-img');
  if (!btn || !img) return;

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var RADIUS = 280;                /* eddig a távolságig veszi észre a kurzort */
  var FULL = RADIUS * 0.5;         /* ezen belül teljes a kitérés */
  var FADE = RADIUS * 0.7;         /* innen kifelé lecseng */

  /* A négy validált hullámhossz — ugyanaz a sorrend, mint a technológia-oldalon */
  var BANDS = [
    'rgba(96, 140, 232, 0.34)',    /* 415 nm — kék */
    'rgba(224, 158, 48, 0.36)',    /* 590 nm — sárga (telítettebb, hogy elefántcsonton is olvasson) */
    'rgba(214, 66, 66, 0.34)',     /* 630 nm — vörös */
    'rgba(150, 54, 78, 0.32)'      /* 850 nm — közeli infravörös */
  ];
  var REST = 'rgba(184, 150, 90, 0.22)';   /* nyugalmi arany */

  btn.classList.add('fm-tilt');

  var raf = null, tx = 0, ty = 0;
  var near = false, timer = null, band = 3;

  function clamp(v) { return v < -1 ? -1 : (v > 1 ? 1 : v); }

  function apply() {
    raf = null;
    img.style.transform = 'rotateX(' + (-ty * 13).toFixed(2) + 'deg) rotateY(' + (tx * 18).toFixed(2) + 'deg)';
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(apply);
  }

  function nextBand() {
    band = (band + 1) % BANDS.length;
    fm.style.setProperty('--fm-led', BANDS[band]);
  }

  function setNear(on) {
    if (on === near) return;
    near = on;
    fm.classList.toggle('fm-near', on);
    if (on) {
      nextBand();
      timer = setInterval(nextBand, 3200);
    } else {
      clearInterval(timer);
      timer = null;
      fm.style.setProperty('--fm-led', REST);
    }
  }

  function rest() {
    setNear(false);
    if (tx || ty) { tx = 0; ty = 0; schedule(); }
  }

  /* A gomb position:fixed, így a középpontja csak átméretezéskor mozdul —
     nem olvasunk layoutot minden egérmozgásnál. */
  var cx = 0, cy = 0;
  function measure() {
    var r = btn.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }
  measure();
  window.addEventListener('resize', measure);

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var d = Math.sqrt(dx * dx + dy * dy);

    if (d > RADIUS) { rest(); return; }

    var falloff = d > FADE ? (RADIUS - d) / (RADIUS - FADE) : 1;
    setNear(true);
    tx = clamp(dx / FULL) * falloff;
    ty = clamp(dy / FULL) * falloff;
    schedule();
  }, { passive: true });

  document.addEventListener('mouseleave', rest);
  window.addEventListener('blur', rest);
})();
