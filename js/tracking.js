/* ═══════════════════════════════════════════════════════════════
   THE ULTIMATE BEAUTY — TRACKING ENGINE
   Központi tubTrack() függvény: GA4 dataLayer + Meta Pixel Lead
   Bekötve: 2026-05-05 — 28 napos GA4-vakság megszűnik
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── EVENT_ID GENERÁTOR (Meta deduplikáció + jövőbeli CAPI-illesztés) ─
  // Ugyanaz az event_id Meta Pixel-nek és későbbi server-side CAPI-nak
  // → Meta nem számolja 2× ugyanazt a Lead-et.
  function generateEventId() {
    return Date.now() + '-' + Math.random().toString(36).slice(2, 11);
  }

  // ─── CENTRAL TRACK FUNCTION ─────────────────────────────────
  // Globális, hívható bárhonnan: window.tubTrack('form_submit_hileft', {source: 'quiz'})
  window.tubTrack = function(eventName, data) {
    data = data || {};
    var eventId = generateEventId();
    var payload = Object.assign({
      event: eventName,
      event_id: eventId,
      page_url: window.location.href
    }, data);

    // GA4 dataLayer push (GTM-en keresztül megy GA4-be)
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push(payload);
    }

    // Meta Pixel Lead event (eventID kulcs a deduplikációhoz)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: data.source || data.form_type || eventName,
        content_category: eventName
      }, { eventID: eventId });
    }

    // Console log (DevTools-ban látható ellenőrzéshez)
    if (window.console && console.log) {
      console.log('[TUB Track]', eventName, 'event_id=' + eventId, data);
    }
  };

  // ─── JOTFORM POSTMESSAGE LISTENER ───────────────────────────
  // Szigorú szűrés: csak az 'submission-completed' message + jotform origin
  // (Resize/scroll/focus message-eket NEM mérünk false-lead-ként)
  var JOTFORM_ALLOWED_ORIGINS = [
    'https://form.jotform.com',
    'https://www.jotform.com',
    'https://eu.jotform.com'
  ];

  window.addEventListener('message', function(e) {
    if (JOTFORM_ALLOWED_ORIGINS.indexOf(e.origin) === -1) return;

    var data = e.data;
    var isSubmit = false;

    // String message — pontos egyenlőség
    if (typeof data === 'string') {
      isSubmit = (data === 'submission-completed');
    }
    // Object message — pontos action-egyenlőség
    else if (typeof data === 'object' && data !== null) {
      isSubmit = (data.action === 'submission-completed');
    }

    if (isSubmit) {
      window.tubTrack('send_form', {
        source: 'jotform',
        form_origin: e.origin
      });
    }
  });

})();
