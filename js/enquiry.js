/* Cook & Collect — "Enquire to Purchase" and "Make an Offer".
 *
 * Progressive enhancement of the two purchase buttons on available shop item
 * pages (built by build.js renderPurchaseActions). Without JavaScript, or while
 * the build sets no ENQUIRY_API_BASE, the buttons stay pre-filled WhatsApp
 * links. With an API base they open a form that posts to the identify-agent
 * Worker (POST <api>/enquiry), which validates everything again, checks the
 * item is still for sale and emails the owner.
 *
 * An offer is a non-binding proposal: nothing here reserves, accepts or marks
 * an item as sold. Runtime strings live here (EN/FR); button labels are built
 * from i18n.js. Analytics events carry no personal data (see js/track.js). */
(function () {
  'use strict';

  var script = document.currentScript;
  var body = document.body;
  if (!body || body.getAttribute('data-purchasable') !== 'true') return;

  var LANG = document.documentElement.lang === 'fr' ? 'fr' : 'en';
  var API = ((script && script.getAttribute('data-api')) || '').replace(/\/+$/, '');
  // Local development and tests only: ?enquiry_api=<url> on localhost.
  var local = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  var override = new URLSearchParams(window.location.search).get('enquiry_api');
  if (local && override) API = override.replace(/\/+$/, '');
  var SITE_KEY = (script && script.getAttribute('data-sitekey')) || '';

  var ITEM = {
    id: body.getAttribute('data-item-id') || '',
    title: body.getAttribute('data-item-title') || '',
    price: body.getAttribute('data-item-price') || ''
  };

  var STRINGS = {
    en: {
      purchaseTitle: 'Enquire to Purchase',
      offerTitle: 'Make an Offer',
      ref: 'Ref.',
      askingPrice: 'Asking price',
      name: 'Your name',
      email: 'Email',
      country: 'Country',
      countryPlaceholder: 'Select your country',
      amount: 'Your offer',
      currency: 'Currency',
      message: 'Message (optional)',
      messagePlaceholderPurchase: 'Questions about the piece, shipping to your country…',
      messagePlaceholderOffer: 'Anything we should know about your offer…',
      consent: 'I agree that Cook & Collect uses these details to answer this request, as described in the',
      privacyLink: 'privacy notice',
      offerNotice: 'An offer is a non-binding proposal. The piece stays on sale until we confirm a sale with you by email.',
      purchaseNotice: 'No payment is taken now: we reply by email to confirm availability, shipping and payment.',
      submitPurchase: 'Send enquiry',
      submitOffer: 'Send offer',
      sending: 'Sending…',
      cancel: 'Cancel',
      close: 'Close',
      retry: 'Try again',
      successPurchaseTitle: 'Thank you, your enquiry has been sent',
      successOfferTitle: 'Thank you, your offer has been sent',
      successText: 'We will reply by email to the address you gave. Your reference:',
      successOfferText: 'This offer is non-binding; the piece is not reserved until we confirm with you.',
      required: 'Please fill in this field.',
      invalidEmail: 'Please enter a valid email address.',
      invalidAmount: 'Please enter an amount greater than 0, with at most 2 decimals.',
      consentRequired: 'Please confirm you agree so we can answer you.',
      tooLong: 'This text is too long.',
      errInvalid: 'Some details need checking — see the highlighted fields.',
      errUnavailable: 'Sorry, this piece is no longer available.',
      errNotFound: 'Sorry, this piece could not be found.',
      errTooFast: 'Please take a moment to check your details, then send again.',
      errRateLimited: 'Too many requests from this connection. Please try again later, or contact us on WhatsApp.',
      errBotCheck: 'The security check did not complete. Please try again.',
      errGeneric: 'Your request could not be sent. Please try again, or contact us on WhatsApp.',
      errOffline: 'You appear to be offline. Check your connection and try again.',
      whatsapp: 'Contact us on WhatsApp'
    },
    fr: {
      purchaseTitle: 'Demande d’achat',
      offerTitle: 'Faire une offre',
      ref: 'Réf.',
      askingPrice: 'Prix demandé',
      name: 'Votre nom',
      email: 'E-mail',
      country: 'Pays',
      countryPlaceholder: 'Choisissez votre pays',
      amount: 'Votre offre',
      currency: 'Devise',
      message: 'Message (facultatif)',
      messagePlaceholderPurchase: 'Questions sur la pièce, livraison dans votre pays…',
      messagePlaceholderOffer: 'Précisions sur votre offre…',
      consent: 'J’accepte que Cook & Collect utilise ces informations pour répondre à cette demande, comme décrit dans la',
      privacyLink: 'politique de confidentialité',
      offerNotice: 'Une offre est une proposition sans engagement. La pièce reste en vente jusqu’à ce que nous confirmions la vente avec vous par e-mail.',
      purchaseNotice: 'Aucun paiement maintenant : nous vous répondons par e-mail pour confirmer la disponibilité, la livraison et le paiement.',
      submitPurchase: 'Envoyer la demande',
      submitOffer: 'Envoyer l’offre',
      sending: 'Envoi…',
      cancel: 'Annuler',
      close: 'Fermer',
      retry: 'Réessayer',
      successPurchaseTitle: 'Merci, votre demande a été envoyée',
      successOfferTitle: 'Merci, votre offre a été envoyée',
      successText: 'Nous vous répondrons par e-mail à l’adresse indiquée. Votre référence :',
      successOfferText: 'Cette offre est sans engagement ; la pièce n’est réservée qu’après notre confirmation.',
      required: 'Veuillez remplir ce champ.',
      invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
      invalidAmount: 'Veuillez saisir un montant supérieur à 0, avec au plus 2 décimales.',
      consentRequired: 'Veuillez confirmer votre accord pour que nous puissions vous répondre.',
      tooLong: 'Ce texte est trop long.',
      errInvalid: 'Certaines informations sont à vérifier — voir les champs signalés.',
      errUnavailable: 'Désolé, cette pièce n’est plus disponible.',
      errNotFound: 'Désolé, cette pièce est introuvable.',
      errTooFast: 'Prenez un instant pour vérifier vos informations, puis renvoyez.',
      errRateLimited: 'Trop de demandes depuis cette connexion. Réessayez plus tard ou contactez-nous sur WhatsApp.',
      errBotCheck: 'La vérification de sécurité n’a pas abouti. Veuillez réessayer.',
      errGeneric: 'Votre demande n’a pas pu être envoyée. Réessayez, ou contactez-nous sur WhatsApp.',
      errOffline: 'Vous semblez hors ligne. Vérifiez votre connexion et réessayez.',
      whatsapp: 'Nous contacter sur WhatsApp'
    }
  };
  var T = STRINGS[LANG];

  // ISO 3166-1 alpha-2; names come from the browser in the page language.
  var COUNTRIES = ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
    'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
    'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
    'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT ' +
    'MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG ' +
    'UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' ');
  var CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var AMOUNT_RE = /^\d{1,7}([.,]\d{1,2})?$/;

  function track(eventName) {
    if (typeof window.ccTrack === 'function') window.ccTrack(eventName, { item_id: ITEM.id, list: 'product' });
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = Array.prototype.map.call(bytes, function (b) { return (b + 256).toString(16).slice(1); }).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === 'text') node.textContent = attrs[key];
      else if (attrs[key] !== false && attrs[key] != null) node.setAttribute(key, attrs[key] === true ? '' : attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  var buttons = document.querySelectorAll('[data-enquiry]');
  var whatsappHrefs = {};
  Array.prototype.forEach.call(buttons, function (btn) {
    whatsappHrefs[btn.getAttribute('data-enquiry')] = btn.getAttribute('href');
  });

  // Without a configured API (or <dialog> support) the WhatsApp links stay; only the intent is measured.
  if (!API || typeof HTMLDialogElement !== 'function') {
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        track(btn.getAttribute('data-enquiry') === 'offer' ? 'begin_make_offer' : 'begin_purchase_enquiry');
      });
    });
    return;
  }

  /* ── Turnstile (only when the build provides a public site key) ── */
  var turnstileWidget = null;
  var turnstileLoading = false;
  function setupTurnstile(container) {
    if (!SITE_KEY) return;
    var render = function () {
      if (window.turnstile && turnstileWidget === null) {
        turnstileWidget = window.turnstile.render(container, { sitekey: SITE_KEY, language: LANG, action: 'enquiry' });
      }
    };
    if (window.turnstile) { render(); return; }
    if (turnstileLoading) return;
    turnstileLoading = true;
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }
  function turnstileToken() {
    return turnstileWidget !== null && window.turnstile ? window.turnstile.getResponse(turnstileWidget) || undefined : undefined;
  }
  function resetTurnstile() {
    if (turnstileWidget !== null && window.turnstile) window.turnstile.reset(turnstileWidget);
  }

  /* ── Dialog ── */
  var state = { type: 'purchase', openedAt: 0, requestId: null, sending: false };
  var privacyLinkEl = document.querySelector('footer a[href$="privacy.html"]');
  var privacyHref = privacyLinkEl ? privacyLinkEl.getAttribute('href') : '../privacy.html';

  function countryOptions() {
    var names = null;
    try { names = new Intl.DisplayNames([LANG], { type: 'region' }); } catch (e) { names = null; }
    var list = COUNTRIES.map(function (code) {
      var label = code;
      try { label = (names && names.of(code)) || code; } catch (e) { label = code; }
      return { code: code, label: label };
    });
    list.sort(function (a, b) { return a.label.localeCompare(b.label, LANG); });
    var options = [el('option', { value: '', text: T.countryPlaceholder })];
    list.forEach(function (c) { options.push(el('option', { value: c.code, text: c.label })); });
    return options;
  }

  function field(id, labelText, control, extraClass) {
    var error = el('p', { class: 'enquiry-field-error', id: id + '-error', hidden: true });
    control.setAttribute('id', id);
    control.setAttribute('aria-describedby', id + '-error');
    return el('div', { class: 'enquiry-field' + (extraClass ? ' ' + extraClass : ''), 'data-field': id.replace('enquiry-', '') }, [
      el('label', { for: id, text: labelText }),
      control,
      error
    ]);
  }

  var dialog = el('dialog', { class: 'enquiry-dialog', 'aria-labelledby': 'enquiry-title' });
  var titleEl = el('h2', { id: 'enquiry-title', class: 'enquiry-title' });
  var closeBtn = el('button', { type: 'button', class: 'enquiry-close', 'aria-label': T.close, text: '×' });
  var summary = el('div', { class: 'enquiry-item' }, [
    el('p', { class: 'enquiry-item-title', text: ITEM.title }),
    el('p', { class: 'enquiry-item-meta', text: T.ref + ' ' + ITEM.id + (ITEM.price ? ' · ' + T.askingPrice + ' ' + ITEM.price : '') })
  ]);

  var nameInput = el('input', { type: 'text', name: 'name', autocomplete: 'name', maxlength: '100', required: true });
  var emailInput = el('input', { type: 'email', name: 'email', autocomplete: 'email', maxlength: '254', required: true, inputmode: 'email' });
  var countrySelect = el('select', { name: 'country', autocomplete: 'country', required: true }, countryOptions());
  var amountInput = el('input', { type: 'text', name: 'offer_amount', inputmode: 'decimal', autocomplete: 'off', maxlength: '10' });
  var currencySelect = el('select', { name: 'currency' }, CURRENCIES.map(function (c) { return el('option', { value: c, text: c }); }));
  var messageInput = el('textarea', { name: 'message', rows: '4', maxlength: '2000' });
  var consentInput = el('input', { type: 'checkbox', name: 'consent', id: 'enquiry-consent', 'aria-describedby': 'enquiry-consent-error', required: true });
  var privacyAnchor = el('a', { href: privacyHref, target: '_blank', rel: 'noopener', text: T.privacyLink });
  var consentLabel = el('label', { for: 'enquiry-consent' }, [document.createTextNode(T.consent + ' '), privacyAnchor, document.createTextNode('.')]);
  var consentField = el('div', { class: 'enquiry-field enquiry-consent', 'data-field': 'consent' }, [
    consentInput, consentLabel, el('p', { class: 'enquiry-field-error', id: 'enquiry-consent-error', hidden: true })
  ]);
  // Honeypot: invisible to people, filled by naive bots; the Worker rejects it.
  var honeypot = el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
  var honeypotWrap = el('div', { class: 'enquiry-hp', 'aria-hidden': 'true' }, [el('label', { text: 'Website' }), honeypot]);

  var offerRow = el('div', { class: 'enquiry-offer-row' }, [
    field('enquiry-amount', T.amount, amountInput, 'enquiry-amount'),
    field('enquiry-currency', T.currency, currencySelect, 'enquiry-currency')
  ]);
  var notice = el('p', { class: 'enquiry-notice' });
  var turnstileBox = el('div', { class: 'enquiry-turnstile' });
  var status = el('div', { class: 'enquiry-status', role: 'status', 'aria-live': 'polite' });
  var submitBtn = el('button', { type: 'submit', class: 'purchase-btn purchase-btn-primary enquiry-submit' });
  var cancelBtn = el('button', { type: 'button', class: 'purchase-btn purchase-btn-secondary enquiry-cancel', text: T.cancel });

  var form = el('form', { class: 'enquiry-form', novalidate: true }, [
    summary,
    field('enquiry-name', T.name, nameInput),
    field('enquiry-email', T.email, emailInput),
    field('enquiry-country', T.country, countrySelect),
    offerRow,
    field('enquiry-message', T.message, messageInput),
    notice,
    consentField,
    honeypotWrap,
    turnstileBox,
    status,
    el('div', { class: 'enquiry-actions' }, [submitBtn, cancelBtn])
  ]);
  var success = el('div', { class: 'enquiry-success', hidden: true, tabindex: '-1' });

  dialog.appendChild(el('div', { class: 'enquiry-header' }, [titleEl, closeBtn]));
  dialog.appendChild(form);
  dialog.appendChild(success);
  document.body.appendChild(dialog);

  function setFieldError(name, message) {
    var wrap = form.querySelector('[data-field="' + name + '"]');
    if (!wrap) return;
    var err = wrap.querySelector('.enquiry-field-error');
    var control = wrap.querySelector('input, select, textarea');
    wrap.classList.toggle('has-error', Boolean(message));
    if (control) control.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) { err.textContent = message || ''; err.hidden = !message; }
  }
  function clearErrors() {
    ['name', 'email', 'country', 'amount', 'currency', 'message', 'consent'].forEach(function (n) { setFieldError(n, ''); });
    status.textContent = '';
    status.className = 'enquiry-status';
  }

  function showStatus(message, isError, withWhatsapp) {
    status.className = 'enquiry-status' + (isError ? ' is-error' : '');
    status.textContent = message;
    if (withWhatsapp) {
      status.appendChild(document.createTextNode(' '));
      status.appendChild(el('a', { href: whatsappHrefs[state.type] || 'https://wa.me/33627335434', target: '_blank', rel: 'noopener noreferrer', text: T.whatsapp }));
    }
  }

  function setSending(sending) {
    state.sending = sending;
    submitBtn.disabled = sending;
    submitBtn.textContent = sending ? T.sending : (state.type === 'offer' ? T.submitOffer : T.submitPurchase);
    form.setAttribute('aria-busy', sending ? 'true' : 'false');
  }

  function openDialog(type) {
    state.type = type;
    state.openedAt = Date.now();
    state.requestId = uuid();
    var isOffer = type === 'offer';
    dialog.classList.toggle('is-offer', isOffer);
    titleEl.textContent = isOffer ? T.offerTitle : T.purchaseTitle;
    offerRow.hidden = !isOffer;
    amountInput.required = isOffer;
    messageInput.placeholder = isOffer ? T.messagePlaceholderOffer : T.messagePlaceholderPurchase;
    notice.textContent = isOffer ? T.offerNotice : T.purchaseNotice;
    form.hidden = false;
    success.hidden = true;
    clearErrors();
    setSending(false);
    document.documentElement.classList.add('enquiry-open');
    dialog.showModal();
    setupTurnstile(turnstileBox);
    track(isOffer ? 'begin_make_offer' : 'begin_purchase_enquiry');
    nameInput.focus();
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('enquiry-open');
  });
  closeBtn.addEventListener('click', closeDialog);
  cancelBtn.addEventListener('click', closeDialog);
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closeDialog(); // backdrop click
  });

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      openDialog(btn.getAttribute('data-enquiry') === 'offer' ? 'offer' : 'purchase');
    });
  });

  function validate() {
    clearErrors();
    var errors = {};
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    if (!name) errors.name = T.required;
    else if (name.length > 100) errors.name = T.tooLong;
    if (!email) errors.email = T.required;
    else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = T.invalidEmail;
    if (!/^[A-Z]{2}$/.test(countrySelect.value)) errors.country = T.required;
    if (messageInput.value.length > 2000) errors.message = T.tooLong;
    if (state.type === 'offer') {
      var raw = amountInput.value.trim().replace(/\s/g, '');
      var amount = Number(raw.replace(',', '.'));
      if (!raw) errors.amount = T.required;
      else if (!AMOUNT_RE.test(raw) || !(amount > 0) || amount > 1000000) errors.amount = T.invalidAmount;
    }
    if (!consentInput.checked) errors.consent = T.consentRequired;
    Object.keys(errors).forEach(function (k) { setFieldError(k, errors[k]); });
    var first = Object.keys(errors)[0];
    if (first) {
      var wrap = form.querySelector('[data-field="' + first + '"]');
      var control = wrap && wrap.querySelector('input, select, textarea');
      if (control) control.focus();
    }
    return !first;
  }

  function payload() {
    var attribution = typeof window.ccAttribution === 'function' ? window.ccAttribution() : { source: 'other' };
    var data = {
      request_id: state.requestId,
      type: state.type,
      lang: LANG,
      item_id: ITEM.id,
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      country: countrySelect.value,
      message: messageInput.value.trim(),
      consent: consentInput.checked,
      website: honeypot.value,
      elapsed_ms: Date.now() - state.openedAt,
      page_path: window.location.pathname,
      attribution: attribution
    };
    if (state.type === 'offer') {
      data.offer_amount = Number(amountInput.value.trim().replace(/\s/g, '').replace(',', '.'));
      data.currency = currencySelect.value;
    }
    var token = turnstileToken();
    if (token) data.turnstile_token = token;
    return data;
  }

  function showSuccess(reference) {
    var isOffer = state.type === 'offer';
    success.textContent = '';
    success.appendChild(el('h3', { text: isOffer ? T.successOfferTitle : T.successPurchaseTitle }));
    var p = el('p', { text: T.successText + ' ' });
    p.appendChild(el('strong', { class: 'enquiry-reference', text: reference || '—' }));
    success.appendChild(p);
    if (isOffer) success.appendChild(el('p', { text: T.successOfferText }));
    var close = el('button', { type: 'button', class: 'purchase-btn purchase-btn-secondary', text: T.close });
    close.addEventListener('click', closeDialog);
    success.appendChild(close);
    form.hidden = true;
    success.hidden = false;
    success.focus();
    form.reset();
  }

  function applyFieldErrors(fields) {
    var map = { offer_amount: 'amount', name: 'name', email: 'email', country: 'country', message: 'message', currency: 'currency', consent: 'consent' };
    (fields || []).forEach(function (f) {
      var key = map[typeof f === 'string' ? f : (f && f.field)];
      if (key) setFieldError(key, key === 'email' ? T.invalidEmail : key === 'amount' ? T.invalidAmount : key === 'consent' ? T.consentRequired : T.required);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (state.sending) return;
    if (!validate()) return;
    setSending(true);
    status.textContent = '';
    var data = payload();
    fetch(API + '/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'omit'
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) { return { res: res, json: json }; });
    }).then(function (result) {
      var res = result.res;
      var json = result.json || {};
      var code = json.error && json.error.code;
      setSending(false);
      if (res.ok && json.ok) {
        track(state.type === 'offer' ? 'submit_make_offer' : 'submit_purchase_enquiry');
        showSuccess(json.reference);
        state.requestId = uuid();
        return;
      }
      // Final answers about this exact submission: the next attempt is a new request.
      if (res.status < 500) state.requestId = uuid();
      resetTurnstile();
      if (res.status === 400) { applyFieldErrors(json.error && json.error.fields); showStatus(T.errInvalid, true); }
      else if (res.status === 409) showStatus(T.errUnavailable, true);
      else if (res.status === 404) showStatus(T.errNotFound, true);
      else if (res.status === 422) showStatus(T.errTooFast, true);
      else if (res.status === 429) showStatus(T.errRateLimited, true, true);
      else if (res.status === 403 && /TURNSTILE/.test(code || '')) showStatus(T.errBotCheck, true);
      // 502 / 503 / other: same request_id, so a retry can never duplicate the email.
      else showStatus(T.errGeneric, true, true);
    }).catch(function () {
      setSending(false);
      showStatus(navigator.onLine === false ? T.errOffline : T.errGeneric, true, true);
    });
  });
})();
