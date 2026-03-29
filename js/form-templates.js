/* ═══════════════════════════════════════════════════════════════
   THE ULTIMATE BEAUTY — FORM TEMPLATES
   7 form HTML generators · Modal wrappers · Inline embeds
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── GDPR CHECKBOX (shared) ──────────────────────────────────
  var GDPR_HTML = '<div class="tub-field">' +
    '<label class="tub-checkbox">' +
    '<input type="checkbox" name="gdpr" required>' +
    '<span class="tub-checkbox__text">Elfogadom az <a href="adatvedelem.html" target="_blank">adatvédelmi tájékoztatót</a>. Hozzájárulok, hogy adataimat a The Ultimate Beauty Clinic az időpont-egyeztetés és kapcsolattartás céljából kezelje.</span>' +
    '</label>' +
    '<span class="tub-error">Az adatvédelmi tájékoztató elfogadása kötelező</span>' +
    '</div>';

  // ═══════════════════════════════════════════════════════════════
  // FORM 1: SZEMÉLYES KONZULTÁCIÓ
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_KONZULTACIO = function(source) {
    return '<div class="tub-form-wrap">' +
      '<div class="tub-form__header">' +
      '<h3 class="tub-form__title">Személyes konzultáció</h3>' +
      '<p class="tub-form__subtitle">60 perces Observ diagnosztikával egybekötött személyes találkozó</p>' +
      '</div>' +
      '<form class="tub-form" data-form-type="konzultacio" data-source="' + (source || '') + '">' +

      '<div class="tub-field--row">' +
        '<div class="tub-field">' +
          '<label class="tub-label">Vezetéknév <span class="tub-label__required">*</span></label>' +
          '<input type="text" name="lastName" class="tub-input" placeholder="Vezetéknév" required>' +
          '<span class="tub-error"></span>' +
        '</div>' +
        '<div class="tub-field">' +
          '<label class="tub-label">Keresztnév <span class="tub-label__required">*</span></label>' +
          '<input type="text" name="firstName" class="tub-input" placeholder="Keresztnév" required>' +
          '<span class="tub-error"></span>' +
        '</div>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Email cím <span class="tub-label__required">*</span></label>' +
        '<input type="email" name="email" class="tub-input" placeholder="email@pelda.hu" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Telefonszám <span class="tub-label__required">*</span></label>' +
        '<input type="tel" name="phone" class="tub-input" placeholder="+36 30 123 4567" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Érdeklődési terület <span class="tub-label__required">*</span></label>' +
        '<select name="interest" class="tub-select" required>' +
          '<option value="">Kérjük válasszon...</option>' +
          '<option value="Integrált arcfiatalítás">Integrált arcfiatalítás</option>' +
          '<option value="Bőrminőség javítás">Bőrminőség javítás</option>' +
          '<option value="Testkezelés">Testkezelés (Venus Legacy + HILEFT)</option>' +
          '<option value="Mini Face Lift">Mini Face Lift konzultáció</option>' +
          '<option value="Szülés utáni regeneráció">Szülés utáni regeneráció</option>' +
          '<option value="Általános konzultáció">Általános konzultáció / Még nem tudom</option>' +
        '</select>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Preferált időpont</label>' +
        '<input type="date" name="preferredDate" class="tub-input">' +
        '<span class="tub-note">Pontos időpontot telefonon egyeztetünk</span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Üzenet</label>' +
        '<textarea name="message" class="tub-textarea" placeholder="Van valami, amit előre szeretne megosztani?" maxlength="500"></textarea>' +
        '<span class="tub-char-count">0/500</span>' +
      '</div>' +

      GDPR_HTML +

      '<button type="submit" class="tub-submit">Konzultáció kérése</button>' +

      '<div class="tub-form__success">' +
        '<div class="tub-form__success-icon">✓</div>' +
        '<h3 class="tub-form__success-title">Köszönjük!</h3>' +
        '<p class="tub-form__success-text">Konzultációs kérését rögzítettük. Munkatársunk 1 munkanapon belül felveszi Önnel a kapcsolatot.</p>' +
      '</div>' +

      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // FORM 2: INGYENES OBSERV BŐRELEMZÉS
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_OBSERV = function(source) {
    return '<div class="tub-form-wrap">' +
      '<div class="tub-form__header">' +
      '<h3 class="tub-form__title">Ingyenes Observ 520x Bőrelemzés</h3>' +
      '<p class="tub-form__subtitle">8 klinikai módban feltérképezzük bőre valódi állapotát — az első 100 páciens számára ajándék.</p>' +
      '</div>' +
      '<form class="tub-form" data-form-type="observ" data-source="' + (source || '') + '">' +

      '<div class="tub-field">' +
        '<label class="tub-label">Teljes név <span class="tub-label__required">*</span></label>' +
        '<input type="text" name="fullName" class="tub-input" placeholder="Teljes név" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Email cím <span class="tub-label__required">*</span></label>' +
        '<input type="email" name="email" class="tub-input" placeholder="email@pelda.hu" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Telefonszám <span class="tub-label__required">*</span></label>' +
        '<input type="tel" name="phone" class="tub-input" placeholder="+36 30 123 4567" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Fő bőrprobléma <span class="tub-label__required">*</span></label>' +
        '<div class="tub-radio-group">' +
          '<label class="tub-radio"><input type="radio" name="skinProblem" value="Öregedés jelei" required><span class="tub-radio__label">Öregedés jelei (ráncok, tónusvesztés)</span></label>' +
          '<label class="tub-radio"><input type="radio" name="skinProblem" value="Pigmentáció"><span class="tub-radio__label">Pigmentáció / bőrtónus egyenetlenség</span></label>' +
          '<label class="tub-radio"><input type="radio" name="skinProblem" value="Aknés bőr"><span class="tub-radio__label">Aknés / problémás bőr</span></label>' +
          '<label class="tub-radio"><input type="radio" name="skinProblem" value="Szárazság"><span class="tub-radio__label">Szárazság / érzékenység</span></label>' +
          '<label class="tub-radio"><input type="radio" name="skinProblem" value="Kíváncsiság"><span class="tub-radio__label">Csak kíváncsi vagyok a bőröm állapotára</span></label>' +
        '</div>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      GDPR_HTML +

      '<button type="submit" class="tub-submit">Kérem az ingyenes bőrelemzést</button>' +

      '<div class="tub-form__success">' +
        '<div class="tub-form__success-icon">🔬</div>' +
        '<h3 class="tub-form__success-title">Gratulálunk!</h3>' +
        '<p class="tub-form__success-text">Ingyenes Observ bőrelemzése lefoglalva! 24 órán belül jelentkezünk az időpont egyeztetéséhez.</p>' +
      '</div>' +

      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // FORM 3: LED MASK ÉRDEKLŐDÉS
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_LED_MASK = function(source) {
    return '<div class="tub-form-wrap">' +
      '<div class="tub-form__header">' +
      '<h3 class="tub-form__title">ULTIMA LED Beauty Mask</h3>' +
      '<p class="tub-form__subtitle">93g · 4 hullámhossz · Otthoni fotobiomoduláció</p>' +
      '</div>' +
      '<form class="tub-form" data-form-type="led-mask" data-source="' + (source || '') + '">' +

      '<div class="tub-field">' +
        '<label class="tub-label">Teljes név <span class="tub-label__required">*</span></label>' +
        '<input type="text" name="fullName" class="tub-input" placeholder="Teljes név" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Email cím <span class="tub-label__required">*</span></label>' +
        '<input type="email" name="email" class="tub-input" placeholder="email@pelda.hu" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Telefonszám <span class="tub-label__required">*</span></label>' +
        '<input type="tel" name="phone" class="tub-input" placeholder="+36 30 123 4567" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Érdeklődés típusa <span class="tub-label__required">*</span></label>' +
        '<div class="tub-radio-group">' +
          '<label class="tub-radio"><input type="radio" name="interestType" value="Vásárlás" required><span class="tub-radio__label">Meg szeretném vásárolni a maszkot</span></label>' +
          '<label class="tub-radio"><input type="radio" name="interestType" value="Kérdés"><span class="tub-radio__label">Kérdésem van a maszk használatáról</span></label>' +
          '<label class="tub-radio"><input type="radio" name="interestType" value="Ajándék Observ"><span class="tub-radio__label">Ajándék Observ bőrelemzést kérek a maszkhoz</span></label>' +
          '<label class="tub-radio"><input type="radio" name="interestType" value="Viszonteladó"><span class="tub-radio__label">Viszonteladói / disztribútori érdeklődés</span></label>' +
        '</div>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field" data-condition="interestType=Kérdés">' +
        '<label class="tub-label">Kérdése</label>' +
        '<textarea name="question" class="tub-textarea" placeholder="Miben segíthetünk?" maxlength="500"></textarea>' +
        '<span class="tub-char-count">0/500</span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Honnan hallott a maszkról?</label>' +
        '<select name="heardFrom" class="tub-select">' +
          '<option value="">Válasszon...</option>' +
          '<option value="Instagram">Instagram</option>' +
          '<option value="Facebook">Facebook</option>' +
          '<option value="Google">Google keresés</option>' +
          '<option value="Ismerős">Ismerős ajánlotta</option>' +
          '<option value="Klinika">A klinikán</option>' +
          '<option value="Egyéb">Egyéb</option>' +
        '</select>' +
      '</div>' +

      GDPR_HTML +

      '<button type="submit" class="tub-submit">Érdeklődés küldése</button>' +

      '<div class="tub-form__success">' +
        '<div class="tub-form__success-icon">💡</div>' +
        '<h3 class="tub-form__success-title">Köszönjük érdeklődését!</h3>' +
        '<p class="tub-form__success-text">Az ULTIMA LED Mask részleteiről munkatársunk hamarosan felveszi Önnel a kapcsolatot.</p>' +
      '</div>' +

      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // FORM 4: CLINICAL PROGRAM
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_CLINICAL = function(source) {
    return '<div class="tub-form-wrap tub-form--wide">' +
      '<div class="tub-form__header">' +
      '<h3 class="tub-form__title">Clinical Program Jelentkezés</h3>' +
      '<p class="tub-form__subtitle">Korlátozott férőhely · Orvosi kiválasztás alapján</p>' +
      '</div>' +
      '<form class="tub-form" data-form-type="clinical" data-source="' + (source || '') + '">' +

      '<div class="tub-field--row">' +
        '<div class="tub-field">' +
          '<label class="tub-label">Teljes név <span class="tub-label__required">*</span></label>' +
          '<input type="text" name="fullName" class="tub-input" placeholder="Teljes név" required>' +
          '<span class="tub-error"></span>' +
        '</div>' +
        '<div class="tub-field">' +
          '<label class="tub-label">Életkor <span class="tub-label__required">*</span></label>' +
          '<input type="number" name="age" class="tub-input" placeholder="Életkor" min="18" max="99" required>' +
          '<span class="tub-error"></span>' +
        '</div>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Email cím <span class="tub-label__required">*</span></label>' +
        '<input type="email" name="email" class="tub-input" placeholder="email@pelda.hu" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Telefonszám <span class="tub-label__required">*</span></label>' +
        '<input type="tel" name="phone" class="tub-input" placeholder="+36 30 123 4567" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Választott program <span class="tub-label__required">*</span></label>' +
        '<select name="program" class="tub-select" required>' +
          '<option value="">Kérjük válasszon...</option>' +
          '<option value="Integrált arcfiatalítás">Integrált arcfiatalítás (Ultimate Lift)</option>' +
          '<option value="Kollagén újraépítés">Kollagén újraépítés (40+)</option>' +
          '<option value="Szemkörnyéki regeneráció">Szemkörnyéki regeneráció</option>' +
          '<option value="Férfi esztétika">Férfi esztétika (Executive Protocol)</option>' +
          '<option value="Testfeszesítés">Testfeszesítés / hasfali rehabilitáció</option>' +
          '<option value="Sebészeti előkészítés">Sebészeti előkészítés és regeneráció</option>' +
        '</select>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Mi a fő célja? <span class="tub-label__required">*</span></label>' +
        '<textarea name="goal" class="tub-textarea" placeholder="Írja le röviden, milyen eredményt szeretne elérni" maxlength="300" required></textarea>' +
        '<span class="tub-char-count">0/300</span>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-form__divider"></div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Volt-e korábban esztétikai beavatkozása? <span class="tub-label__required">*</span></label>' +
        '<div class="tub-radio-group">' +
          '<label class="tub-radio"><input type="radio" name="previousProcedure" value="Igen" required><span class="tub-radio__label">Igen</span></label>' +
          '<label class="tub-radio"><input type="radio" name="previousProcedure" value="Nem"><span class="tub-radio__label">Nem</span></label>' +
        '</div>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field" data-condition="previousProcedure=Igen">' +
        '<label class="tub-label">Milyen beavatkozás?</label>' +
        '<input type="text" name="procedureDetails" class="tub-input" placeholder="Pl. botox, hialuronsav, lézer...">' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Van-e ismert allergiája vagy egészségügyi állapota? <span class="tub-label__required">*</span></label>' +
        '<div class="tub-radio-group">' +
          '<label class="tub-radio"><input type="radio" name="allergy" value="Igen" required><span class="tub-radio__label">Igen</span></label>' +
          '<label class="tub-radio"><input type="radio" name="allergy" value="Nem"><span class="tub-radio__label">Nem</span></label>' +
        '</div>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field" data-condition="allergy=Igen">' +
        '<label class="tub-label">Kérjük részletezze</label>' +
        '<input type="text" name="allergyDetails" class="tub-input" placeholder="Allergiák, gyógyszerek, állapotok...">' +
      '</div>' +

      GDPR_HTML +

      '<button type="submit" class="tub-submit">Jelentkezés elküldése</button>' +

      '<div class="tub-form__success">' +
        '<div class="tub-form__success-icon">🏥</div>' +
        '<h3 class="tub-form__success-title">Jelentkezését megkaptuk</h3>' +
        '<p class="tub-form__success-text">A Clinical Programba való bekerülés orvosi kiválasztás alapján történik. Orvosunk 2-3 munkanapon belül áttekinti jelentkezését.</p>' +
      '</div>' +

      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // FORM 5: FOUNDING ACCESS
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_FOUNDING = function(source) {
    return '<div class="tub-form-wrap tub-form--wide">' +
      '<div class="tub-form__header">' +
      '<h3 class="tub-form__title">Founding Access</h3>' +
      '<p class="tub-form__subtitle">Csatlakozzon a nyitási időszakhoz — válassza ki szintjét</p>' +
      '</div>' +
      '<form class="tub-form" data-form-type="founding" data-source="' + (source || '') + '">' +

      '<div class="tub-field">' +
        '<label class="tub-label">Válassza ki szintjét <span class="tub-label__required">*</span></label>' +
        '<div class="tub-card-group">' +

          '<label class="tub-card-radio">' +
            '<input type="radio" name="foundingLevel" value="Discovery" required>' +
            '<div class="tub-card-radio__content">' +
              '<div class="tub-card-radio__badge">Ingyenes</div>' +
              '<div class="tub-card-radio__title">Discovery</div>' +
              '<div class="tub-card-radio__desc">Ajándék Observ bőrelemzés · Hírlevél · Elsőként értesül</div>' +
            '</div>' +
          '</label>' +

          '<label class="tub-card-radio">' +
            '<input type="radio" name="foundingLevel" value="Early Access">' +
            '<div class="tub-card-radio__content">' +
              '<div class="tub-card-radio__badge">Ajánlott</div>' +
              '<div class="tub-card-radio__title">Early Access</div>' +
              '<div class="tub-card-radio__desc">HILEFT kezelés · Kedvezményes LED Mask · Elsőbbségi időpont · Minden Discovery előny</div>' +
            '</div>' +
          '</label>' +

          '<label class="tub-card-radio">' +
            '<input type="radio" name="foundingLevel" value="Founding Member">' +
            '<div class="tub-card-radio__content">' +
              '<div class="tub-card-radio__badge">Limitált</div>' +
              '<div class="tub-card-radio__title">Founding Member</div>' +
              '<div class="tub-card-radio__desc">Teljes Protocol ciklus · VIP árazás életre szólóan · Személyes kapcsolat · Minden Early Access előny</div>' +
            '</div>' +
          '</label>' +

        '</div>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-form__divider"></div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Teljes név <span class="tub-label__required">*</span></label>' +
        '<input type="text" name="fullName" class="tub-input" placeholder="Teljes név" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Email cím <span class="tub-label__required">*</span></label>' +
        '<input type="email" name="email" class="tub-input" placeholder="email@pelda.hu" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Telefonszám <span class="tub-label__required">*</span></label>' +
        '<input type="tel" name="phone" class="tub-input" placeholder="+36 30 123 4567" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Honnan hallott rólunk?</label>' +
        '<select name="heardFrom" class="tub-select">' +
          '<option value="">Válasszon...</option>' +
          '<option value="Instagram">Instagram</option>' +
          '<option value="Facebook">Facebook</option>' +
          '<option value="Google">Google keresés</option>' +
          '<option value="Ismerős">Ismerős ajánlotta</option>' +
          '<option value="Egyéb">Egyéb</option>' +
        '</select>' +
      '</div>' +

      '<div class="tub-field" data-condition="foundingLevel=Early Access,Founding Member">' +
        '<label class="tub-label">Preferált kezdés</label>' +
        '<input type="date" name="preferredStart" class="tub-input">' +
      '</div>' +

      '<div class="tub-field" data-condition="foundingLevel=Founding Member">' +
        '<label class="tub-label">Rövid bemutatkozás</label>' +
        '<textarea name="introduction" class="tub-textarea" placeholder="Miért szeretne Founding Member lenni?" maxlength="500"></textarea>' +
        '<span class="tub-char-count">0/500</span>' +
      '</div>' +

      GDPR_HTML +

      '<button type="submit" class="tub-submit">Regisztráció</button>' +

      '<div class="tub-form__success">' +
        '<div class="tub-form__success-icon">⭐</div>' +
        '<h3 class="tub-form__success-title">Helye biztosítva!</h3>' +
        '<p class="tub-form__success-text">Founding Access regisztrációját rögzítettük. Hamarosan felvesszük Önnel a kapcsolatot.</p>' +
      '</div>' +

      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // FORM 6: AKADÉMIA
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_AKADEMIA = function(source) {
    return '<div class="tub-form-wrap tub-form--wide">' +
      '<div class="tub-form__header">' +
      '<h3 class="tub-form__title">The Ultimate Beauty Akadémia</h3>' +
      '<p class="tub-form__subtitle">A Protocol tudásbázisa — válassza ki programját</p>' +
      '</div>' +
      '<form class="tub-form" data-form-type="akademia" data-source="' + (source || '') + '">' +

      '<div class="tub-field">' +
        '<label class="tub-label">Válasszon programot <span class="tub-label__required">*</span></label>' +
        '<div class="tub-radio-group">' +
          '<label class="tub-radio"><input type="radio" name="program" value="Tudatos Páciens Workshop" required><span class="tub-radio__label"><strong>„Tudatos Páciens" Workshop</strong> — pácienseknek, 1 napos</span></label>' +
          '<label class="tub-radio"><input type="radio" name="program" value="Referens Associate Képzés"><span class="tub-radio__label"><strong>„Referens Associate" Képzés</strong> — szakembereknek, akkreditált</span></label>' +
          '<label class="tub-radio"><input type="radio" name="program" value="Inhouse Referens Belső Képzés"><span class="tub-radio__label"><strong>„Inhouse Referens" Belső Képzés</strong> — klinikák számára, testreszabott</span></label>' +
        '</div>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-form__divider"></div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Teljes név <span class="tub-label__required">*</span></label>' +
        '<input type="text" name="fullName" class="tub-input" placeholder="Teljes név" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Email cím <span class="tub-label__required">*</span></label>' +
        '<input type="email" name="email" class="tub-input" placeholder="email@pelda.hu" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Telefonszám <span class="tub-label__required">*</span></label>' +
        '<input type="tel" name="phone" class="tub-input" placeholder="+36 30 123 4567" required>' +
        '<span class="tub-error"></span>' +
      '</div>' +

      '<!-- Workshop specifikus -->' +
      '<div class="tub-field" data-condition="program=Tudatos Páciens Workshop">' +
        '<label class="tub-label">Mi érdekli legjobban?</label>' +
        '<div class="tub-multi-check">' +
          '<label class="tub-checkbox"><input type="checkbox" name="interests" value="Bőrápolás alapjai"><span class="tub-checkbox__text">Bőrápolás alapjai</span></label>' +
          '<label class="tub-checkbox"><input type="checkbox" name="interests" value="LED technológia"><span class="tub-checkbox__text">LED technológia megértése</span></label>' +
          '<label class="tub-checkbox"><input type="checkbox" name="interests" value="Observ diagnosztika"><span class="tub-checkbox__text">Observ diagnosztika megértése</span></label>' +
          '<label class="tub-checkbox"><input type="checkbox" name="interests" value="Otthoni protokoll"><span class="tub-checkbox__text">Otthoni protokoll tervezés</span></label>' +
        '</div>' +
      '</div>' +

      '<!-- Referens specifikus -->' +
      '<div class="tub-field" data-condition="program=Referens Associate Képzés">' +
        '<label class="tub-label">Foglalkozás</label>' +
        '<input type="text" name="occupation" class="tub-input" placeholder="Pl. kozmetikus, orvos...">' +
      '</div>' +
      '<div class="tub-field" data-condition="program=Referens Associate Képzés">' +
        '<label class="tub-label">Tapasztalat</label>' +
        '<select name="experience" class="tub-select">' +
          '<option value="">Válasszon...</option>' +
          '<option value="0-2 év">0-2 év</option>' +
          '<option value="3-5 év">3-5 év</option>' +
          '<option value="5-10 év">5-10 év</option>' +
          '<option value="10+ év">10+ év</option>' +
        '</select>' +
      '</div>' +

      '<!-- Inhouse specifikus -->' +
      '<div class="tub-field" data-condition="program=Inhouse Referens Belső Képzés">' +
        '<label class="tub-label">Cég neve</label>' +
        '<input type="text" name="company" class="tub-input" placeholder="Cég neve">' +
      '</div>' +
      '<div class="tub-field" data-condition="program=Inhouse Referens Belső Képzés">' +
        '<label class="tub-label">Beosztás</label>' +
        '<input type="text" name="position" class="tub-input" placeholder="Beosztás">' +
      '</div>' +

      '<div class="tub-field">' +
        '<label class="tub-label">Motiváció</label>' +
        '<textarea name="motivation" class="tub-textarea" placeholder="Miért szeretne részt venni?" maxlength="300"></textarea>' +
        '<span class="tub-char-count">0/300</span>' +
      '</div>' +

      GDPR_HTML +

      '<button type="submit" class="tub-submit">Jelentkezés elküldése</button>' +

      '<div class="tub-form__success">' +
        '<div class="tub-form__success-icon">🎓</div>' +
        '<h3 class="tub-form__success-title">Jelentkezését megkaptuk!</h3>' +
        '<p class="tub-form__success-text">Akadémia programunkról hamarosan részletes tájékoztatást küldünk.</p>' +
      '</div>' +

      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // FORM 7: NEWSLETTER (compact)
  // ═══════════════════════════════════════════════════════════════
  window.TUB_FORM_NEWSLETTER = function(source) {
    return '<div class="tub-form-wrap tub-form--compact">' +
      '<form class="tub-form" data-form-type="newsletter" data-source="' + (source || 'footer') + '">' +
        '<input type="email" name="email" class="tub-input" placeholder="Email cím" required>' +
        '<input type="hidden" name="firstName" value="">' +
        '<button type="submit" class="tub-submit">Feliratkozás</button>' +
      '</form></div>';
  };

  // ═══════════════════════════════════════════════════════════════
  // MODAL WRAPPERS — wrap any form in a modal
  // ═══════════════════════════════════════════════════════════════
  window.TUB_MODAL = function(id, formHtml) {
    return '<div class="tub-form-modal" id="' + id + '">' +
      '<div class="tub-form-modal__overlay"></div>' +
      '<div class="tub-form-modal__box">' +
      '<button class="tub-form-modal__close">&times;</button>' +
      formHtml +
      '</div></div>';
  };

  // ─── AUTO-RENDER: Fill placeholders with forms ──────────────
  function tubRenderForms() {
    // Find all [data-tub-form] placeholders and inject forms
    document.querySelectorAll('[data-tub-form]').forEach(function(el) {
      if (el.dataset.tubRendered) return; // skip already rendered
      var formType = el.dataset.tubForm;
      var source = el.dataset.source || '';
      var generators = {
        'konzultacio': TUB_FORM_KONZULTACIO,
        'observ': TUB_FORM_OBSERV,
        'led-mask': TUB_FORM_LED_MASK,
        'clinical': TUB_FORM_CLINICAL,
        'founding': TUB_FORM_FOUNDING,
        'akademia': TUB_FORM_AKADEMIA,
        'newsletter': TUB_FORM_NEWSLETTER
      };
      if (generators[formType]) {
        el.innerHTML = generators[formType](source);
        el.dataset.tubRendered = '1';
      }
    });
  }

  // Run immediately if DOM already loaded, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tubRenderForms);
  } else {
    tubRenderForms();
  }

  // Expose for dynamic re-rendering (e.g., after tab switch)
  window.TUBRenderForms = tubRenderForms;

})();
