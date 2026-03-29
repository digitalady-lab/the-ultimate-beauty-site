/* ═══════════════════════════════════════════════════════════════
   THE ULTIMATE BEAUTY — FORM ENGINE
   7 form types · Validation · Conditional logic · Google Sheets
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── CONFIG ─────────────────────────────────────────────────
  var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyPkz4jNjYHbRheU24YT9zV5BIqNw6B1jQ2PuQBaZ1kYYrkXBe6eNJht20e3GVRIC97xA/exec';
  // ✅ Deployed v2 — 2026-03-23

  // ─── FORM REGISTRY ──────────────────────────────────────────
  // Each form type has its own config for success messages
  var FORM_CONFIG = {
    'konzultacio': {
      successTitle: 'Köszönjük!',
      successText: 'Konzultációs kérését rögzítettük. Munkatársunk 1 munkanapon belül felveszi Önnel a kapcsolatot az időpont véglegesítéséhez.',
      successIcon: '✓',
      sheetName: 'Konzultáció'
    },
    'observ': {
      successTitle: 'Gratulálunk!',
      successText: 'Ingyenes Observ 520x bőrelemzése lefoglalva! 24 órán belül jelentkezünk az időpont egyeztetéséhez.',
      successIcon: '🔬',
      sheetName: 'Observ'
    },
    'led-mask': {
      successTitle: 'Köszönjük érdeklődését!',
      successText: 'Az ULTIMA LED Mask részleteiről munkatársunk hamarosan felveszi Önnel a kapcsolatot.',
      successIcon: '💡',
      sheetName: 'LED Mask'
    },
    'clinical': {
      successTitle: 'Jelentkezését megkaptuk',
      successText: 'A Clinical Programba való bekerülés orvosi kiválasztás alapján történik. Orvosunk 2-3 munkanapon belül áttekinti jelentkezését.',
      successIcon: '🏥',
      sheetName: 'Clinical Program'
    },
    'founding': {
      successTitle: 'Helye biztosítva!',
      successText: 'Founding Access regisztrációját rögzítettük. Hamarosan felvesszük Önnel a kapcsolatot a részletekről.',
      successIcon: '⭐',
      sheetName: 'Founding Access'
    },
    'akademia': {
      successTitle: 'Jelentkezését megkaptuk!',
      successText: 'Akadémia programunkról hamarosan részletes tájékoztatást küldünk.',
      successIcon: '🎓',
      sheetName: 'Akadémia'
    },
    'newsletter': {
      successTitle: 'Feliratkozva!',
      successText: 'Köszönjük! Hamarosan kapja első hírlevelünket.',
      successIcon: '📧',
      sheetName: 'Newsletter'
    }
  };

  // ─── INIT: Auto-bind all TUB forms ───────────────────────────
  function tubFormsInit() {
    var forms = document.querySelectorAll('.tub-form[data-form-type]');
    forms.forEach(function(form) {
      initForm(form);
    });

    // Init modal open/close
    initModals();

    // Init conditional fields
    initConditionalFields();
  }

  // Run immediately if DOM already loaded, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tubFormsInit);
  } else {
    tubFormsInit();
  }

  // ─── FORM INITIALIZATION ────────────────────────────────────
  function initForm(form) {
    // Prevent double init
    if (form.dataset.tubInit) return;
    form.dataset.tubInit = '1';

    // Radio active state styling
    form.querySelectorAll('.tub-radio input[type="radio"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        var group = this.closest('.tub-radio-group');
        if (group) {
          group.querySelectorAll('.tub-radio').forEach(function(r) { r.classList.remove('tub-radio--active'); });
          this.closest('.tub-radio').classList.add('tub-radio--active');
        }
        // Also handle card radios
        var cardGroup = this.closest('.tub-card-group');
        if (cardGroup) {
          cardGroup.querySelectorAll('.tub-card-radio').forEach(function(r) { r.classList.remove('tub-card-radio--active'); });
          this.closest('.tub-card-radio').classList.add('tub-card-radio--active');
        }
        // Trigger conditional field check
        checkConditions(form);
      });
    });

    // Multi-checkbox active state
    form.querySelectorAll('.tub-multi-check input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        this.closest('.tub-checkbox').classList.toggle('tub-checkbox--active', this.checked);
      });
    });

    // Character counter for textareas
    form.querySelectorAll('.tub-textarea[maxlength]').forEach(function(ta) {
      var counter = ta.parentElement.querySelector('.tub-char-count');
      if (!counter) return;
      ta.addEventListener('input', function() {
        var max = parseInt(ta.getAttribute('maxlength'));
        var current = ta.value.length;
        counter.textContent = current + '/' + max;
        counter.classList.remove('tub-char-count--warn', 'tub-char-count--max');
        if (current > max * 0.85) counter.classList.add('tub-char-count--warn');
        if (current >= max) counter.classList.add('tub-char-count--max');
      });
    });

    // Submit handler
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleSubmit(form);
    });

    // Clear error on input
    form.querySelectorAll('.tub-input, .tub-textarea, .tub-select').forEach(function(input) {
      input.addEventListener('input', function() {
        clearFieldError(this);
      });
    });
  }

  // ─── CONDITIONAL FIELDS ─────────────────────────────────────
  function initConditionalFields() {
    // Observe all radio/select changes and toggle conditional fields
    document.querySelectorAll('.tub-form[data-form-type]').forEach(function(form) {
      form.querySelectorAll('select, input[type="radio"]').forEach(function(el) {
        el.addEventListener('change', function() {
          checkConditions(form);
        });
      });
    });
  }

  function checkConditions(form) {
    form.querySelectorAll('[data-condition]').forEach(function(field) {
      var condition = field.dataset.condition; // e.g. "interest=question"
      var parts = condition.split('=');
      var fieldName = parts[0];
      var expectedValue = parts[1];

      var sourceEl = form.querySelector('[name="' + fieldName + '"]:checked') ||
                     form.querySelector('select[name="' + fieldName + '"]');
      var currentValue = sourceEl ? sourceEl.value : '';

      // Support comma-separated values for OR logic
      var expectedValues = expectedValue.split(',');
      var isMatch = expectedValues.indexOf(currentValue) !== -1;

      if (isMatch) {
        field.classList.add('tub-field--visible');
      } else {
        field.classList.remove('tub-field--visible');
        // Clear the conditional field's value when hidden
        var inputs = field.querySelectorAll('input, textarea, select');
        inputs.forEach(function(inp) { inp.value = ''; });
      }
    });
  }

  // ─── VALIDATION ─────────────────────────────────────────────
  function validateForm(form) {
    var isValid = true;
    var firstError = null;

    // Required text inputs, textareas, selects
    form.querySelectorAll('[required]').forEach(function(field) {
      // Skip hidden conditional fields
      var parentField = field.closest('.tub-field[data-condition]');
      if (parentField && !parentField.classList.contains('tub-field--visible')) return;

      if (field.type === 'checkbox') {
        if (!field.checked) {
          showFieldError(field, 'Kötelező mező');
          isValid = false;
          if (!firstError) firstError = field;
        }
        return;
      }

      if (field.type === 'radio') {
        var radioGroup = form.querySelectorAll('input[name="' + field.name + '"]');
        var anyChecked = Array.from(radioGroup).some(function(r) { return r.checked; });
        if (!anyChecked) {
          showFieldError(radioGroup[0], 'Kérjük válasszon egy opciót');
          isValid = false;
          if (!firstError) firstError = radioGroup[0];
        }
        return;
      }

      if (!field.value.trim()) {
        showFieldError(field, 'Kötelező mező');
        isValid = false;
        if (!firstError) firstError = field;
      }
    });

    // Email validation
    form.querySelectorAll('input[type="email"]').forEach(function(field) {
      if (field.value && !isValidEmail(field.value)) {
        showFieldError(field, 'Érvénytelen email cím');
        isValid = false;
        if (!firstError) firstError = field;
      }
    });

    // Phone validation
    form.querySelectorAll('input[type="tel"]').forEach(function(field) {
      if (field.value && !isValidPhone(field.value)) {
        showFieldError(field, 'Érvénytelen telefonszám');
        isValid = false;
        if (!firstError) firstError = field;
      }
    });

    // Age validation
    form.querySelectorAll('input[type="number"][name="age"]').forEach(function(field) {
      var val = parseInt(field.value);
      if (field.value && (val < 18 || val > 99)) {
        showFieldError(field, 'Életkor: 18–99');
        isValid = false;
        if (!firstError) firstError = field;
      }
    });

    // Scroll to first error
    if (firstError) {
      var el = firstError.closest('.tub-field') || firstError;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    var digits = phone.replace(/[\s\-\(\)\+]/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  function showFieldError(field, message) {
    field.classList.add('tub-input--error', 'tub-textarea--error', 'tub-select--error');
    var fieldWrap = field.closest('.tub-field') || field.closest('.tub-radio-group') || field.parentElement;
    var errorEl = fieldWrap.querySelector('.tub-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('tub-error--visible');
    }
  }

  function clearFieldError(field) {
    field.classList.remove('tub-input--error', 'tub-textarea--error', 'tub-select--error');
    var fieldWrap = field.closest('.tub-field') || field.parentElement;
    var errorEl = fieldWrap.querySelector('.tub-error');
    if (errorEl) errorEl.classList.remove('tub-error--visible');
  }

  // ─── FORM SUBMISSION ────────────────────────────────────────
  function handleSubmit(form) {
    if (!validateForm(form)) return;

    var formType = form.dataset.formType;
    var config = FORM_CONFIG[formType] || FORM_CONFIG['newsletter'];
    var submitBtn = form.querySelector('.tub-submit');

    // Loading state
    submitBtn.classList.add('tub-submit--loading');
    submitBtn.disabled = true;

    // Collect form data
    var data = collectFormData(form);
    data.formType = formType;
    data.sheetName = config.sheetName;
    data.timestamp = new Date().toISOString();
    data.pageUrl = window.location.href;

    // UTM params from URL
    var urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'source'].forEach(function(param) {
      if (urlParams.get(param)) data[param] = urlParams.get(param);
    });

    // Hidden fields (source from form attribute)
    if (form.dataset.source) data.source = form.dataset.source;

    // 1. Save to localStorage (fallback)
    saveToLocalStorage(formType, data);

    // 2. Send to Google Sheets
    sendToGoogleSheets(data, function(success) {
      submitBtn.classList.remove('tub-submit--loading');

      if (success) {
        showSuccess(form, config);
      } else {
        // Even on error, show success (data is in localStorage)
        // We'll retry from localStorage later
        showSuccess(form, config);
        console.warn('[TUB Forms] Google Sheets küldés sikertelen, localStorage-ba mentve.');
      }
    });
  }

  // ─── COLLECT FORM DATA ──────────────────────────────────────
  function collectFormData(form) {
    var data = {};

    // Text inputs, email, tel, number, date
    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"], textarea, select').forEach(function(field) {
      if (field.name && field.value) {
        // Skip hidden conditional fields
        var parentCond = field.closest('.tub-field[data-condition]');
        if (parentCond && !parentCond.classList.contains('tub-field--visible')) return;
        data[field.name] = field.value.trim();
      }
    });

    // Radio buttons
    form.querySelectorAll('input[type="radio"]:checked').forEach(function(radio) {
      data[radio.name] = radio.value;
    });

    // Checkboxes (multi-select, not GDPR)
    var checkGroups = {};
    form.querySelectorAll('.tub-multi-check input[type="checkbox"]:checked').forEach(function(cb) {
      if (!checkGroups[cb.name]) checkGroups[cb.name] = [];
      checkGroups[cb.name].push(cb.value);
    });
    Object.keys(checkGroups).forEach(function(name) {
      data[name] = checkGroups[name].join(', ');
    });

    // GDPR
    var gdpr = form.querySelector('input[name="gdpr"]');
    if (gdpr) data.gdpr = gdpr.checked ? 'Elfogadva' : 'Nem';

    // Combine firstName + lastName into fullName (for konzultáció form)
    if (data.firstName && data.lastName && !data.fullName) {
      data.fullName = data.lastName + ' ' + data.firstName;
    }

    // Ensure fullName exists for any form that has name fields
    if (!data.fullName && data.name) {
      data.fullName = data.name;
    }

    return data;
  }

  // ─── LOCALSTORAGE SAVE ──────────────────────────────────────
  function saveToLocalStorage(formType, data) {
    var key = 'tub_form_' + formType;
    var list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(data);
    localStorage.setItem(key, JSON.stringify(list));

    // Also save to master email list
    if (data.email) {
      var nlKey = 'tub_newsletter';
      var nl = JSON.parse(localStorage.getItem(nlKey) || '[]');
      if (nl.indexOf(data.email) === -1) {
        nl.push(data.email);
        localStorage.setItem(nlKey, JSON.stringify(nl));
      }
    }
  }

  // ─── GOOGLE SHEETS SEND ─────────────────────────────────────
  function sendToGoogleSheets(data, callback) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf('REPLACE') !== -1) {
      console.warn('[TUB Forms] Google Apps Script URL nincs beállítva!');
      callback(false);
      return;
    }

    // Method 1: fetch with no-cors (works on https:// origins)
    // Method 2: form POST fallback (works on file:// too)
    var payload = JSON.stringify(data);

    // Try fetch first
    if (window.location.protocol !== 'file:') {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: payload
      }).then(function() {
        console.log('[TUB Forms] Mentve (fetch):', data.formType, data.email || '');
        callback(true);
      }).catch(function(err) {
        console.warn('[TUB Forms] Fetch hiba, form fallback:', err);
        sendViaFormPost(payload, callback, data);
      });
    } else {
      // file:// protocol — use hidden form POST
      sendViaFormPost(payload, callback, data);
    }
  }

  // Fallback: hidden iframe form submit (works from any origin)
  function sendViaFormPost(payload, callback, data) {
    try {
      var iframe = document.createElement('iframe');
      iframe.name = 'tub_submit_frame_' + Date.now();
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      var form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SCRIPT_URL;
      form.target = iframe.name;
      form.style.display = 'none';

      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = payload;
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();

      // Cleanup after 5s
      setTimeout(function() {
        if (form.parentNode) form.parentNode.removeChild(form);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 5000);

      console.log('[TUB Forms] Mentve (form POST):', data.formType, data.email || '');
      callback(true);
    } catch(err) {
      console.warn('[TUB Forms] Form POST hiba:', err);
      callback(false);
    }
  }

  // ─── SHOW SUCCESS ───────────────────────────────────────────
  function showSuccess(form, config) {
    // Hide form fields
    var fields = form.querySelectorAll('.tub-field, .tub-field--row, .tub-submit, .tub-form__divider');
    fields.forEach(function(f) { f.style.display = 'none'; });

    // Show success message
    var successEl = form.querySelector('.tub-form__success');
    if (successEl) {
      successEl.classList.add('tub-form__success--visible');
    } else {
      // Create success message dynamically
      var div = document.createElement('div');
      div.className = 'tub-form__success tub-form__success--visible';
      div.innerHTML =
        '<div class="tub-form__success-icon">' + config.successIcon + '</div>' +
        '<h3 class="tub-form__success-title">' + config.successTitle + '</h3>' +
        '<p class="tub-form__success-text">' + config.successText + '</p>';
      form.appendChild(div);
    }
  }

  // ─── MODAL SYSTEM ───────────────────────────────────────────
  function initModals() {
    // Open modal from data-tub-modal="formId"
    document.querySelectorAll('[data-tub-modal]').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        var modalId = this.dataset.tubModal;
        var modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('tub-form-modal--active');
          document.body.style.overflow = 'hidden';

          // Set source from trigger
          if (this.dataset.source) {
            var form = modal.querySelector('.tub-form');
            if (form) form.dataset.source = this.dataset.source;
          }
        }
      });
    });

    // Close modal on overlay click
    document.querySelectorAll('.tub-form-modal__overlay').forEach(function(overlay) {
      overlay.addEventListener('click', function() {
        closeModal(this.closest('.tub-form-modal'));
      });
    });

    // Close modal on close button
    document.querySelectorAll('.tub-form-modal__close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        closeModal(this.closest('.tub-form-modal'));
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var activeModal = document.querySelector('.tub-form-modal--active');
        if (activeModal) closeModal(activeModal);
      }
    });
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('tub-form-modal--active');
    document.body.style.overflow = '';
  }

  // ─── PUBLIC API ─────────────────────────────────────────────
  window.TUBForms = {
    init: tubFormsInit, // Re-run init (e.g., after modals are added)
    openModal: function(id) {
      var modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('tub-form-modal--active');
        document.body.style.overflow = 'hidden';
      }
    },
    closeModal: closeModal,
    // Retry sending localStorage data
    retryLocalStorage: function() {
      Object.keys(localStorage).forEach(function(key) {
        if (key.indexOf('tub_form_') !== 0) return;
        var list = JSON.parse(localStorage.getItem(key) || '[]');
        list.forEach(function(data) {
          sendToGoogleSheets(data, function(success) {
            if (success) console.log('[TUB] Retry sikeres:', key);
          });
        });
      });
    }
  };

})();
