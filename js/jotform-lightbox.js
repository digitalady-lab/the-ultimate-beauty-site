/* ═══════════════════════════════════════════════════════════════
   THE ULTIMATE BEAUTY — JOTFORM LIGHTBOX
   Univerzális felugró ablak JotForm űrlapokhoz
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── FORM REGISTRY ───────────────────────────────────────────
  // 2026.04.17: Jotform → GHL migráció. A gombok data-jf-form attribútumai
  // változatlanok (marketing hook megmarad), a háttérben viszont GHL widget
  // nyílik. Kivétel: LED Mask (sajátépítésű Jotform, marad) + Newsletter
  // (későbbi GHL form-ra migrálandó).
  //
  // type:
  //   'ghl-widget' → GHL booking widget (personal consultation, observ stb.)
  //   'jotform'    → a régi form.jotform.com iframe (led-mask, newsletter)
  //
  // source: a GHL kontaktus tag-elésére ('source:observ', stb.) fűzött
  //   URL-paraméter. A GHL widget mögötti workflow tudja olvasni.

  var GHL_CONSULT_WIDGET = 'OEo4yWoP1ABdeuNprCYw'; // Személyes Konzultáció, 45 perc

  var FORMS = {
    'konzultacio':  { type: 'ghl-widget', widgetId: GHL_CONSULT_WIDGET, title: 'Személyes Konzultáció Foglalás' },
    'observ':       { type: 'ghl-widget', widgetId: GHL_CONSULT_WIDGET, title: 'Ingyenes Observ 520x Bőrelemzés',
                      source: 'observ' },
    'clinical':     { type: 'ghl-widget', widgetId: GHL_CONSULT_WIDGET, title: 'Clinical Program Jelentkezés',
                      source: 'clinical' },
    'founding':     { type: 'ghl-widget', widgetId: GHL_CONSULT_WIDGET, title: 'Klinikai Vizsgálat Jelentkezés',
                      source: 'founding' },
    'akademia':     { type: 'ghl-widget', widgetId: GHL_CONSULT_WIDGET, title: 'Akadémia Jelentkezés',
                      source: 'akademia' },
    'led-mask':     { type: 'jotform',    id: '260812571961055', title: 'ULTIMA LED Mask Érdeklődés' },
    // TODO: GHL newsletter-form-ra migrálni, amint létrejön
    'newsletter':   { type: 'jotform',    id: '260812738145054', title: 'Feliratkozás' }
  };

  // ─── URL BUILDER ─────────────────────────────────────────────
  function buildFormUrl(config, source) {
    var effectiveSource = source || config.source || '';
    var params = [];

    if (config.type === 'ghl-widget') {
      var base = 'https://api.leadconnectorhq.com/widget/booking/' + config.widgetId;
      if (effectiveSource) params.push('source=' + encodeURIComponent(effectiveSource));
      return params.length ? base + '?' + params.join('&') : base;
    }

    // Jotform (alapértelmezett)
    var base2 = 'https://form.jotform.com/' + config.id;
    if (effectiveSource) params.push('source=' + encodeURIComponent(effectiveSource));
    if (config.prepopulate) {
      Object.keys(config.prepopulate).forEach(function(key) {
        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(config.prepopulate[key]));
      });
    }
    return params.length ? base2 + '?' + params.join('&') : base2;
  }

  // ─── CREATE MODAL HTML ───────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'jf-lightbox-overlay';
  overlay.id = 'jfLightbox';
  overlay.innerHTML =
    '<div class="jf-lightbox-box">' +
      '<div class="jf-lightbox-header">' +
        '<h3 class="jf-lightbox-title" id="jfLightboxTitle"></h3>' +
        '<button class="jf-lightbox-close" onclick="window.TUBLightbox.close()" aria-label="Bezárás">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="jf-lightbox-body" id="jfLightboxBody">' +
        '<div class="jf-lightbox-loading">Betöltés</div>' +
      '</div>' +
    '</div>';

  // Insert into DOM when ready
  function insertOverlay() {
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(overlay);
      });
    }
  }
  insertOverlay();

  // ─── OPEN LIGHTBOX ───────────────────────────────────────────
  function openLightbox(formKey, source) {
    var config = FORMS[formKey];
    if (!config) {
      console.warn('[TUB Lightbox] Ismeretlen form:', formKey);
      return;
    }

    var titleEl = document.getElementById('jfLightboxTitle');
    var bodyEl = document.getElementById('jfLightboxBody');

    // Set title
    titleEl.textContent = config.title;

    // Build iframe URL (GHL widget vagy Jotform, formType alapján)
    var url = buildFormUrl(config, source);

    // Check if we have a preloaded iframe for this form
    if (preloadedForm === formKey && preloadIframe) {
      // Reuse preloaded iframe — instant! 🚀
      bodyEl.innerHTML = '';
      preloadIframe.style.cssText = 'width:100%; min-height:700px; border:none; display:block;';
      preloadIframe.tabIndex = 0;
      preloadIframe.removeAttribute('aria-hidden');
      bodyEl.appendChild(preloadIframe);
      preloadIframe = null;
      preloadedForm = null;
    } else {
      // Fresh load with loading indicator
      bodyEl.innerHTML = '<div class="jf-lightbox-loading">Betöltés</div>';

      var iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = config.title;
      iframe.style.width = '100%';
      iframe.style.minHeight = '700px';
      iframe.style.border = 'none';
      iframe.style.display = 'none';
      iframe.setAttribute('allow', 'geolocation; microphone; camera; fullscreen');
      iframe.allowFullscreen = true;

      iframe.onload = function() {
        var loader = bodyEl.querySelector('.jf-lightbox-loading');
        if (loader) loader.remove();
        iframe.style.display = 'block';
      };

      bodyEl.appendChild(iframe);
    }

    // Show overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Conversion tracking
    if(typeof gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': 'AW-18069239911/consultation_lead',
        'event_category': 'form',
        'event_label': source || 'unknown'
      });
    }

    // Track opening
    console.log('[TUB Lightbox] Megnyitva:', formKey, source || '');
  }

  // ─── CLOSE LIGHTBOX ──────────────────────────────────────────
  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    // Destroy iframe after animation
    setTimeout(function() {
      var bodyEl = document.getElementById('jfLightboxBody');
      if (bodyEl) bodyEl.innerHTML = '';
    }, 400);
  }

  // ─── CLOSE ON OVERLAY CLICK ──────────────────────────────────
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // ─── CLOSE ON ESC ────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeLightbox();
    }
  });

  // ─── JOTFORM AUTO-RESIZE ────────────────────────────────────
  window.addEventListener('message', function(e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d.action === 'setHeight' || (d['action-type'] === 'setHeight')) {
        var h = parseInt(d.height || d.scrollHeight, 10);
        if (h > 100) {
          var iframes = overlay.querySelectorAll('iframe');
          for (var i = 0; i < iframes.length; i++) {
            if (iframes[i].contentWindow === e.source) {
              iframes[i].style.minHeight = h + 'px';
              break;
            }
          }
        }
      }
      // Handle form submit success
      if (d.action === 'submission-completed' || d.action === 'thankyou-page-shown') {
        // Auto-close after 3s on success
        setTimeout(function() {
          closeLightbox();
        }, 3000);
      }
    } catch(err) {}
  }, false);

  // ─── HOVER PRELOAD ──────────────────────────────────────────
  // Gomb fölé húzva az egeret → előtölti a formot rejtve
  var preloadedForm = null;
  var preloadIframe = null;

  function preloadForm(formKey, source) {
    if (preloadedForm === formKey) return; // már előtöltve
    var config = FORMS[formKey];
    if (!config) return;

    // Destroy previous preload
    if (preloadIframe && preloadIframe.parentNode) {
      preloadIframe.parentNode.removeChild(preloadIframe);
    }

    // Create hidden iframe to preload
    preloadIframe = document.createElement('iframe');
    preloadIframe.src = buildFormUrl(config, source);
    preloadIframe.style.cssText = 'position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; top:-9999px;';
    preloadIframe.tabIndex = -1;
    preloadIframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(preloadIframe);
    preloadedForm = formKey;
    console.log('[TUB Lightbox] Előtöltés:', formKey);
  }

  document.addEventListener('mouseenter', function(e) {
    var trigger = e.target.closest('[data-jf-form]');
    if (trigger) {
      preloadForm(
        trigger.getAttribute('data-jf-form'),
        trigger.getAttribute('data-jf-source') || ''
      );
    }
  }, true);

  // Mobile: preload on touchstart
  document.addEventListener('touchstart', function(e) {
    var trigger = e.target.closest('[data-jf-form]');
    if (trigger) {
      preloadForm(
        trigger.getAttribute('data-jf-form'),
        trigger.getAttribute('data-jf-source') || ''
      );
    }
  }, { passive: true });

  // ─── AUTO-BIND TRIGGERS ──────────────────────────────────────
  // Any element with data-jf-form="formKey" will open the lightbox
  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('[data-jf-form]');
    if (trigger) {
      e.preventDefault();
      var formKey = trigger.getAttribute('data-jf-form');
      var source = trigger.getAttribute('data-jf-source') || '';
      openLightbox(formKey, source);
    }
  });

  // ─── PUBLIC API ──────────────────────────────────────────────
  window.TUBLightbox = {
    open: openLightbox,
    close: closeLightbox
  };

})();
