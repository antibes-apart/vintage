/* Visitor identification: up to 6 photos + notes -> documentary possibilities from the reference archive.
 * Talks to the identify-agent Worker API (POST /identify). Storage consent is a condition of use and is sent with
 * every request. Photos are resized and re-encoded in the browser (which also drops their metadata) before upload.
 * All API text is inserted with textContent, never as HTML. English only. */
(function () {
  'use strict';

  // Must match CONSENT_VERSION in identify-agent/src/identify/http.ts (and the consent text in i18n.js).
  var CONSENT_VERSION = '2026-11-identify-2';
  var MAX_PHOTOS = 6;
  var MAX_PHOTO_BYTES = 1024 * 1024;
  // Largest edge and JPEG quality, tried in order until a photo fits the upload limit.
  var ATTEMPTS = [[2560, 0.88], [2560, 0.8], [2048, 0.8], [1600, 0.75], [1280, 0.7]];
  var VISITOR_KEY = 'identify-visitor';
  var T = {
    tooManyPhotos: 'You can add up to 6 photos.',
    noPhotos: 'Add at least one photo.',
    noConsent: 'Please tick the box to agree that your photos are stored. The agent cannot be used without it.',
    photoUnreadable: 'This photo could not be read. Use a JPEG, PNG or WebP photo.',
    preparing: 'Preparing your photos…',
    working: 'Reading your photos and searching the archive. This can take up to a minute…',
    done: 'Done.',
    removePhoto: 'Remove photo',
    nothingRead: 'Nothing readable was found in these photos.',
    years: function (years) { return years.length === 1 ? 'Documented in ' + years[0] : 'Documented ' + years[0] + '–' + years[years.length - 1]; },
    support: function (n, c) {
      return n + (n === 1 ? ' of your details matches' : ' of your details match') +
        (c ? ', ' + c + ' ' + (c === 1 ? 'conflicts' : 'conflict') : '') + '.';
    },
    page: 'page',
    reference: function (ref) {
      return 'Case reference: ' + ref + '. Keep it if you want your photos deleted: email vintagetreasurecontact@gmail.com with this reference.';
    },
    remaining: function (n) { return n === 1 ? ' 1 identification left today.' : ' ' + n + ' identifications left today.'; },
    errors: {
      VISITOR_DAILY_LIMIT: 'You have reached today’s limit. Please come back tomorrow.',
      IP_DAILY_LIMIT: 'Today’s limit has been reached from this connection. Please come back tomorrow.',
      DAILY_LIMIT_REACHED: 'The agent has reached its daily limit. Please come back tomorrow.',
      TURNSTILE_REQUIRED: 'Please complete the security check above, then try again.',
      TURNSTILE_FAILED: 'The security check did not succeed. Please try again.',
      PROVIDER_BUSY: 'The photo reading service is busy. Please try again in a minute.',
      PROVIDER_TIMEOUT: 'Reading the photos took too long. Please try again.',
      PROVIDER_FAILED: 'The photos could not be read this time. Please try again.',
      INVALID_IMAGE: 'One of the photos could not be used. Try another photo.',
      PHOTO_TOO_LARGE: 'One of the photos is too large even after resizing.',
      REQUEST_TOO_LARGE: 'The photos are too large together. Use fewer photos.',
      INVALID_REQUEST: 'The request was not accepted. Reload the page and try again.',
      ORIGIN_NOT_ALLOWED: 'The agent cannot be used from this address.',
      IDENTIFY_UNAVAILABLE: 'The agent is temporarily unavailable. Please try again later.',
      network: 'The agent could not be reached. Check your connection and try again.',
      generic: 'Something went wrong. Please try again.'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var photos = []; // { file, url }
  var turnstileWidget = null;

  /* ── API address: set at build time; a local override is allowed only on a local development host. ── */
  function apiBase() {
    var base = document.body.getAttribute('data-api') || '';
    var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    var override = new URLSearchParams(location.search).get('api');
    if (local && override && /^https?:\/\/[^\s]+$/.test(override)) base = override;
    return base.replace(/\/+$/, '');
  }
  function load(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked */ } }

  function setStatus(text, isError) {
    var el = $('identify-status');
    el.textContent = text || '';
    el.classList.toggle('studio-status-error', !!isError);
  }
  function busy(on) {
    ['identify-submit', 'identify-photos', 'identify-notes', 'identify-consent'].forEach(function (id) { $(id).disabled = on; });
    document.body.classList.toggle('studio-busy', on);
  }

  /* ── Photos ── */
  function renderThumbs() {
    var list = $('identify-thumbs');
    list.textContent = '';
    photos.forEach(function (photo, index) {
      var li = document.createElement('li');
      var img = document.createElement('img');
      img.src = photo.url; img.alt = '';
      var remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'studio-thumb-remove';
      remove.setAttribute('aria-label', T.removePhoto + ' ' + (index + 1));
      remove.textContent = '×';
      remove.addEventListener('click', function () {
        URL.revokeObjectURL(photo.url);
        photos.splice(index, 1);
        renderThumbs();
      });
      li.appendChild(img); li.appendChild(remove); list.appendChild(li);
    });
  }
  function addFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    setStatus(photos.length + files.length > MAX_PHOTOS ? T.tooManyPhotos : '', photos.length + files.length > MAX_PHOTOS);
    files.slice(0, MAX_PHOTOS - photos.length).forEach(function (file) {
      photos.push({ file: file, url: URL.createObjectURL(file) });
    });
    renderThumbs();
  }
  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(',')[1]); };
      reader.onerror = function () { reject(new Error('photoUnreadable')); };
      reader.readAsDataURL(blob);
    });
  }
  // Orientation is applied and the photo is re-encoded as JPEG, which removes EXIF/GPS metadata.
  // The server strips metadata again and never trusts the browser alone.
  async function preparePhoto(file) {
    var bitmap;
    try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { throw new Error('photoUnreadable'); }
    var canvas = document.createElement('canvas');
    try {
      for (var i = 0; i < ATTEMPTS.length; i++) {
        var scale = Math.min(1, ATTEMPTS[i][0] / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        var blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', ATTEMPTS[i][1]); });
        if (blob && blob.size <= MAX_PHOTO_BYTES) return { media_type: 'image/jpeg', data: await blobToBase64(blob) };
      }
    } finally {
      if (bitmap.close) bitmap.close();
    }
    throw new Error('PHOTO_TOO_LARGE');
  }

  /* ── Bot check: only when the site has a Turnstile site key. ── */
  function setupTurnstile() {
    var siteKey = document.body.getAttribute('data-turnstile-sitekey');
    if (!siteKey) return;
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = function () {
      if (window.turnstile) turnstileWidget = window.turnstile.render('#identify-turnstile', { sitekey: siteKey, language: 'en' });
    };
    document.head.appendChild(script);
  }
  function turnstileToken() {
    return turnstileWidget !== null && window.turnstile ? window.turnstile.getResponse(turnstileWidget) || undefined : undefined;
  }
  function resetTurnstile() { if (turnstileWidget !== null && window.turnstile) window.turnstile.reset(turnstileWidget); }

  /* ── Result ── */
  function element(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  }
  function observationText(row) {
    var value = row.kind === 'measurement' ? row.property.toLowerCase() + ': ' + row.value + (row.unit ? ' ' + row.unit : '') : row.value;
    var parts = [row.kind === 'measurement' ? '' : row.kind + ': ', value];
    if (row.component && row.component !== 'unknown') parts.push(' (' + row.component + ')');
    if (row.certainty === 'uncertain') parts.push(' — uncertain');
    return parts.join('');
  }
  function renderPossibility(possibility) {
    var card = element('article', 'identify-possibility');
    card.appendChild(element('h3', null, possibility.source_title));
    var meta = [];
    if (possibility.documented_years.length) meta.push(T.years(possibility.documented_years));
    meta.push(T.support(possibility.supporting_observations, possibility.conflicting_observations));
    card.appendChild(element('p', 'studio-hint', meta.join(' · ')));
    var list = element('ul');
    possibility.evidence.forEach(function (claim) {
      var text = claim.property.toLowerCase().replace(/_/g, ' ') + ': ' + (claim.value || '—');
      if (claim.documented_year) text += ' (' + claim.documented_year + ')';
      if (claim.page_label) text += ' — ' + T.page + ' ' + claim.page_label;
      list.appendChild(element('li', null, text));
    });
    card.appendChild(list);
    return card;
  }
  function showResult(result) {
    $('identify-notice').textContent = result.notice || '';
    $('identify-message').textContent = result.message || '';
    var question = $('identify-question');
    question.hidden = !result.clarification;
    question.textContent = result.clarification ? result.clarification.question : '';
    var possibilities = $('identify-possibilities');
    possibilities.textContent = '';
    (result.possibilities || []).forEach(function (row) { possibilities.appendChild(renderPossibility(row)); });
    var observations = $('identify-observations');
    observations.textContent = '';
    var rows = result.observations || [];
    if (!rows.length) observations.appendChild(element('li', null, T.nothingRead));
    rows.forEach(function (row) { observations.appendChild(element('li', null, observationText(row))); });
    $('identify-reference').textContent = T.reference(result.case_reference);
    $('identify-result').hidden = false;
    $('identify-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submit(event) {
    event.preventDefault();
    if (!photos.length) return setStatus(T.noPhotos, true);
    if (!$('identify-consent').checked) return setStatus(T.noConsent, true);
    busy(true);
    try {
      setStatus(T.preparing);
      var prepared = [];
      for (var i = 0; i < photos.length; i++) prepared.push(await preparePhoto(photos[i].file));
      setStatus(T.working);
      var body = { consent: { accepted: true, version: CONSENT_VERSION }, photos: prepared, notes: $('identify-notes').value.trim() };
      var visitor = load(VISITOR_KEY);
      if (visitor) body.visitor = visitor;
      var token = turnstileToken();
      if (token) body.turnstile_token = token;
      var response;
      try {
        response = await fetch(apiBase() + '/identify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body) });
      } catch (e) { throw new Error('network'); }
      var result = null;
      try { result = await response.json(); } catch (e) { /* not JSON */ }
      if (!response.ok) {
        var failure = new Error((result && result.error && result.error.code) || 'generic');
        failure.reference = result && result.case_reference;
        throw failure;
      }
      if (result.visitor) save(VISITOR_KEY, result.visitor);
      showResult(result);
      setStatus(T.done + (typeof result.identifications_remaining_today === 'number'
        ? T.remaining(result.identifications_remaining_today) : ''));
    } catch (error) {
      var code = error && error.message;
      var text = code === 'photoUnreadable' ? T.photoUnreadable : T.errors[code] || T.errors.generic;
      setStatus(error && error.reference ? text + ' ' + T.reference(error.reference) : text, true);
    } finally {
      resetTurnstile();
      busy(false);
    }
  }

  function reset() {
    photos.forEach(function (photo) { URL.revokeObjectURL(photo.url); });
    photos = [];
    renderThumbs();
    $('identify-notes').value = '';
    $('identify-result').hidden = true;
    setStatus('');
    $('identify-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function init() {
    if (!apiBase()) {
      $('identify-unavailable').hidden = false;
      $('identify-form').hidden = true;
      return;
    }
    $('identify-photos').addEventListener('change', function (event) { addFiles(event.target.files); event.target.value = ''; });
    $('identify-form').addEventListener('submit', submit);
    $('identify-new').addEventListener('click', reset);
    setupTurnstile();
  }
  init();
})();
