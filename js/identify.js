/* Visitor identification conversation: photos and optional follow-up messages.
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
    working: 'The agent is reading your message. This can take up to two minutes…',
    done: 'Done.',
    removePhoto: 'Remove photo',
    period: function (period) {
      var span = period.from === period.to ? 'in ' + period.from : 'between ' + period.from + ' and ' + period.to;
      return 'Pieces matching yours are documented ' + span + ' (' + period.sources + (period.sources === 1 ? ' source' : ' sources') +
        '). This is when such pieces appear in our documents, not proof of when yours was made.';
    },
    estimatePeriod: function (period) {
      return period.from === period.to ? 'Probably made around ' + period.from : 'Probably made between ' + period.from + ' and ' + period.to;
    },
    estimateNoPeriod: 'No period could be estimated from these photos',
    confidence: { low: 'low confidence', medium: 'medium confidence', high: 'high confidence' },
    estimateHint: 'An AI opinion, not an authentication or valuation. It can be wrong.',
    undated: 'The matching documents are not dated yet in our archive, so no period can be given.',
    reference: function (ref) {
      return 'Case reference: ' + ref + '. Keep it if you want your photos deleted: email vintagetreasurecontact@gmail.com with this reference.';
    },
    retrying: 'The connection was interrupted. Trying again…',
    remaining: function (n) { return n === 1 ? ' 1 identification left today.' : ' ' + n + ' identifications left today.'; },
    errors: {
      VISITOR_DAILY_LIMIT: 'You have reached today’s limit. Please come back tomorrow.',
      IP_DAILY_LIMIT: 'Today’s limit has been reached from this connection. Please come back tomorrow.',
      DAILY_LIMIT_REACHED: 'The agent has reached its daily limit. Please come back tomorrow.',
      DAILY_BUDGET_REACHED: 'The agent has reached its daily budget. Please come back tomorrow.',
      VISITOR_FOLLOWUP_DAILY_LIMIT: 'You have reached today’s follow-up limit. Please come back tomorrow.',
      IP_FOLLOWUP_DAILY_LIMIT: 'Today’s follow-up limit has been reached from this connection. Please come back tomorrow.',
      REQUEST_IN_PROGRESS: 'This message is still being processed. Retry in a moment; it will not be sent twice.',
      FOLLOWUP_LIMIT_REACHED: 'This conversation has reached its follow-up limit. You can start a new identification.',
      CONVERSATION_EXPIRED: 'This conversation has expired after 24 hours. Start a new identification.',
      NEW_IDENTIFICATION_REQUIRED: 'A new identification is required. Start a new identification below.',
      CASE_NOT_FOUND: 'This conversation could not be found. Start a new identification below.',
      TOO_MANY_CASE_PHOTOS: 'A conversation can contain at most 10 photos. Remove additional photos or start a new identification.',
      TURNSTILE_REQUIRED: 'Please complete the security check above, then try again.',
      TURNSTILE_FAILED: 'The security check did not succeed. Please try again.',
      PROVIDER_BUSY: 'The photo reading service is busy. Please try again in a minute.',
      PROVIDER_TIMEOUT: 'Reading the photos took too long. Please try again.',
      PROVIDER_FAILED: 'The photos could not be read this time. Please try again.',
      INVALID_IMAGE: 'One of the photos could not be used. Try another photo.',
      PHOTO_TOO_LARGE: 'One of the photos is too large even after resizing.',
      REQUEST_TOO_LARGE: 'The photos are too large together. Use fewer photos.',
      INVALID_REQUEST: 'The request was not accepted. Edit your message or start a new identification.',
      ORIGIN_NOT_ALLOWED: 'The agent cannot be used from this address.',
      IDENTIFY_UNAVAILABLE: 'The agent is temporarily unavailable. Please try again later.',
      network: 'The agent could not be reached, even after a second try. Check your connection and try again.',
      generic: 'Something went wrong. Please try again.'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var photos = []; // { file, url }
  var turnstileWidget = null;
  var caseReference = null;
  var caseVisitor = null;
  var followupsRemaining = 5;
  var photoCount = 0;
  var pending = null; // Kept only in memory, including the exact serialized body for idempotent retries.
  var stopped = false;
  var sending = false;

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
    sending = on;
    ['identify-photos', 'identify-notes', 'identify-consent'].forEach(function (id) {
      $(id).disabled = on || stopped || !!pending;
    });
    $('identify-submit').disabled = on || stopped;
    $('identify-new').disabled = on;
    $('identify-edit').disabled = on;
    document.querySelectorAll('.studio-thumb-remove').forEach(function (button) { button.disabled = on || !!pending || stopped; });
    $('identify-submit').textContent = pending ? 'Retry message' : caseReference ? 'Send message' : 'Identify my piece';
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
    var available = Math.min(MAX_PHOTOS, 10 - photoCount);
    if (files.length + photos.length > available && available < MAX_PHOTOS) {
      setStatus(T.errors.TOO_MANY_CASE_PHOTOS, true);
      files = files.slice(0, Math.max(0, available - photos.length));
    } else {
      setStatus(photos.length + files.length > MAX_PHOTOS ? T.tooManyPhotos : '', photos.length + files.length > MAX_PHOTOS);
    }
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
  function visitorMessage(notes) {
    var bubble = element('article', 'identify-turn identify-turn-visitor');
    bubble.appendChild(element('h2', null, 'You'));
    var images = element('div', 'identify-turn-photos');
    photos.forEach(function (photo) {
      var image = element('img');
      image.src = URL.createObjectURL(photo.file);
      image.alt = 'Your piece';
      images.appendChild(image);
    });
    bubble.appendChild(images);
    if (notes) bubble.appendChild(element('p', null, notes));
    $('identify-transcript').appendChild(bubble);
    return bubble;
  }
  function showResult(result) {
    var bubble = element('article', 'identify-turn identify-turn-agent');
    bubble.appendChild(element('h2', null, 'Cook & Collect · Identification agent'));
    var estimate = result.ai_estimate;
    if (estimate) {
      var box = element('div', 'identify-estimate');
      box.appendChild(element('p', 'identify-estimate-name', estimate.identification));
      box.appendChild(element('p', 'identify-period', estimate.period ? T.estimatePeriod(estimate.period) : T.estimateNoPeriod));
      box.appendChild(element('p', null, estimate.explanation));
      bubble.appendChild(box);
    } else {
      bubble.appendChild(element('p', null, result.message || 'No identification could be made yet.'));
    }
    if (result.period) bubble.appendChild(element('p', 'identify-documentary-period', T.period(result.period)));
    else if (!estimate && (result.possibilities || []).length) bubble.appendChild(element('p', null, T.undated));
    var confidence = result.confidence;
    if (confidence) {
      var summary = element('section', 'identify-confidence');
      summary.setAttribute('aria-label', 'Confidence');
      ['identification', 'dating'].forEach(function (kind) {
        var value = confidence[kind];
        if (!value) return;
        var label = kind === 'dating' ? 'Dating' : 'Identification';
        summary.appendChild(element('p', null, label + ': ' + (T.confidence[value.level] || 'confidence unavailable') + '. ' + (value.reason || '')));
      });
      var sources = typeof confidence.supporting_sources === 'number' ? confidence.supporting_sources : 0;
      var similarities = typeof confidence.similarities === 'number' ? confidence.similarities : 0;
      summary.appendChild(element('p', 'studio-hint', sources + ' supporting ' + (sources === 1 ? 'source' : 'sources') +
        ' · ' + similarities + ' similarity ' + (similarities === 1 ? 'reference' : 'references') + '.'));
      if (estimate && confidence.ai_only) summary.appendChild(element('p', null, 'AI-only estimate: not supported by documentary evidence.'));
      bubble.appendChild(summary);
    } else if (estimate && T.confidence[estimate.confidence]) {
      bubble.appendChild(element('p', null, 'AI estimate: ' + T.confidence[estimate.confidence] + '.'));
    }
    if (estimate && estimate.next_detail) bubble.appendChild(element('p', 'identify-suggestion', 'Optional next detail: ' + estimate.next_detail));
    bubble.appendChild(element('p', 'studio-hint', estimate ? T.estimateHint : 'Documentary support is not an authentication or valuation.'));
    $('identify-transcript').appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateConversation(result) {
    if (result.visitor) {
      caseVisitor = result.visitor;
      save(VISITOR_KEY, result.visitor);
    }
    if (result.case_reference) {
      caseReference = result.case_reference;
      $('identify-reference').textContent = T.reference(caseReference);
      $('identify-reference').hidden = false;
      $('identify-consent-field').hidden = true;
      document.querySelector('label[for="identify-photos"]').textContent = 'Additional photos (optional, up to 6)';
    }
    if (typeof result.followups_remaining === 'number') followupsRemaining = Math.max(0, Math.min(5, result.followups_remaining));
    if (caseReference) {
      $('identify-followups').hidden = false;
      $('identify-followups').textContent = followupsRemaining + ' optional follow-up message(s) left. Conversations last 24 hours.';
      if (followupsRemaining === 0) {
        stopped = true;
        $('identify-followups').textContent += ' Start a new identification to discuss another piece.';
      }
    }
  }

  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
  // Both automatic and explicit retries reuse the exact body and request_id.
  async function post(payload) {
    for (var attempt = 0; ; attempt++) {
      try {
        var response = await fetch(apiBase() + '/identify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
        var result = await response.json();
        return { response: response, result: result };
      } catch (e) {
        if (attempt > 0) throw new Error('network');
        setStatus(T.retrying);
        await wait(2000);
        setStatus(T.working);
      }
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (sending || stopped) return;
    if (!pending && !caseReference && !photos.length) return setStatus(T.noPhotos, true);
    if (!pending && caseReference && !photos.length && !$('identify-notes').value.trim()) return setStatus('Add a message or a photo to continue.', true);
    if (!pending && !$('identify-consent').checked) return setStatus(T.noConsent, true);
    if (!pending && photoCount + photos.length > 10) return setStatus(T.errors.TOO_MANY_CASE_PHOTOS, true);
    busy(true);
    try {
      if (!pending) {
        setStatus(T.preparing);
        var prepared = [];
        for (var i = 0; i < photos.length; i++) prepared.push(await preparePhoto(photos[i].file));
        var body = { request_id: crypto.randomUUID(), consent: { accepted: true, version: CONSENT_VERSION }, photos: prepared, notes: $('identify-notes').value.trim() };
        var visitor = caseVisitor || load(VISITOR_KEY);
        if (visitor) body.visitor = visitor;
        if (caseReference) body.case_reference = caseReference;
        var token = turnstileToken();
        if (token) body.turnstile_token = token;
        pending = { body: JSON.stringify(body), initial: !caseReference, count: photos.length, bubble: visitorMessage(body.notes) };
      }
      $('identify-edit').hidden = true;
      setStatus(T.working);
      var reply = await post(pending.body);
      var result = reply.result;
      if (!reply.response.ok) {
        var code = (result && result.error && result.error.code) || 'generic';
        var failedInitial = pending.initial && result && result.case_reference && code !== 'REQUEST_IN_PROGRESS';
        // A returned case belongs to this request even when its provider failed.
        if (result && result.case_reference && /^PROVIDER_/.test(code) && !pending.counted) {
          photoCount += pending.count;
          pending.counted = true;
          if (!pending.initial && typeof result.followups_remaining !== 'number') followupsRemaining--;
        }
        if (result) updateConversation(result);
        if (failedInitial) $('identify-followups').hidden = true;
        if (['FOLLOWUP_LIMIT_REACHED', 'CONVERSATION_EXPIRED', 'NEW_IDENTIFICATION_REQUIRED', 'CASE_NOT_FOUND'].indexOf(code) !== -1) stopped = true;
        if (code !== 'REQUEST_IN_PROGRESS') {
          pending.editable = !failedInitial;
          $('identify-edit').hidden = stopped || !!failedInitial;
        }
        var failure = new Error(code);
        failure.reference = result && result.case_reference;
        failure.initialFailed = !!failedInitial;
        throw failure;
      }
      var initial = pending.initial;
      if (!pending.counted) photoCount += pending.count;
      if (!initial && typeof result.followups_remaining !== 'number') followupsRemaining--;
      updateConversation(result);
      showResult(result);
      pending = null;
      clearPhotos();
      $('identify-notes').value = '';
      resetTurnstile();
      setStatus(T.done + (initial && typeof result.identifications_remaining_today === 'number'
        ? T.remaining(result.identifications_remaining_today) : ''));
    } catch (error) {
      var code = error && error.message;
      var text = code === 'photoUnreadable' ? T.photoUnreadable : T.errors[code] || T.errors.generic;
      if (error.initialFailed) text += ' This identification could not be completed. Choose Identify another piece to start a new case; Retry message only retrieves this same response.';
      if (pending && pending.editable && !stopped) text += ' Choose Edit message to send a new request, or Retry message to resend this same request.';
      setStatus(error && error.reference ? text + ' ' + T.reference(error.reference) : text, true);
    } finally {
      busy(false);
    }
  }

  function clearPhotos() {
    photos.forEach(function (photo) { URL.revokeObjectURL(photo.url); });
    photos = [];
    renderThumbs();
  }
  function reset() {
    clearPhotos();
    $('identify-transcript').querySelectorAll('img').forEach(function (image) { URL.revokeObjectURL(image.src); });
    $('identify-transcript').textContent = '';
    caseReference = null;
    caseVisitor = null;
    followupsRemaining = 5;
    photoCount = 0;
    pending = null;
    stopped = false;
    $('identify-reference').hidden = true;
    $('identify-followups').hidden = true;
    $('identify-consent-field').hidden = false;
    $('identify-consent').checked = false;
    $('identify-edit').hidden = true;
    document.querySelector('label[for="identify-photos"]').textContent = 'Photos (1 to 6)';
    $('identify-notes').value = '';
    setStatus('');
    resetTurnstile();
    busy(false);
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
    $('identify-edit').addEventListener('click', function () {
      if (!pending || !pending.editable) return;
      pending.bubble.appendChild(element('p', 'studio-hint', 'Not answered.'));
      if (pending.counted) clearPhotos();
      pending = null;
      $('identify-edit').hidden = true;
      resetTurnstile();
      busy(false);
      setStatus('Edit your message, then send it as a new request' + (caseReference ? ' in this conversation.' : '.'));
    });
    setupTurnstile();
  }
  init();
})();
