/* Listing studio: photos + notes -> Catawiki description, then adjustments by chat.
 * Talks to the identify-agent Worker API (POST /listing, POST /listing/revise).
 * Photos are resized and re-encoded in the browser (which also drops their metadata) before upload.
 * Nothing is stored by the site: the chat session lives in this tab, the visitor token and the optional
 * owner admin key in this browser only. All API text is inserted with textContent, never as HTML. */
(function () {
  'use strict';

  var LANG = document.documentElement.lang === 'fr' ? 'fr' : 'en';
  var STRINGS = {
    en: {
      tooManyPhotos: 'You can add up to 10 photos.',
      noPhotos: 'Add at least one photo.',
      photoUnreadable: 'This photo could not be read. Use a JPEG, PNG or WebP photo.',
      preparing: 'Preparing your photos…',
      writing: 'Reading the photos and writing the description. This can take up to a minute…',
      revising: 'Updating the description…',
      done: 'Description ready.',
      revised: 'Description updated.',
      copied: 'Text copied.',
      copyFailed: 'Copying did not work; select the text and copy it manually.',
      remaining: function (n) { return n === 1 ? '1 adjustment left for this object.' : n + ' adjustments left for this object.'; },
      removePhoto: 'Remove photo',
      none: 'Nothing to report.',
      ownerActive: 'Owner access active in this browser.',
      ownerInactive: 'Owner access not set.',
      ownerSaved: 'Owner key saved.',
      ownerRemoved: 'Owner key removed.',
      ownerRequired: 'This studio is reserved for the site owner. Enter the owner key to use it.',
      savingArchive: 'Preparing the photos and saving to the archive…',
      savedArchive: 'Saved to the archive. It will appear on the website once publishing is switched on.',
      saveNeedsPhotos: 'The photos are no longer in this page. Start a new object with the same photos to save it to the archive.',
      errors: {
        VISITOR_DAILY_LIMIT: 'You have reached today’s limit. Please come back tomorrow.',
        IP_DAILY_LIMIT: 'Today’s limit has been reached from this connection. Please come back tomorrow.',
        DAILY_BUDGET_REACHED: 'The studio is very busy today. Please come back tomorrow.',
        ADMIN_DAILY_CAP_REACHED: 'The owner’s daily safety limit has been reached.',
        ADMIN_KEY_INVALID: 'The owner key is not valid. Remove it or enter it again.',
        TURNSTILE_REQUIRED: 'Please complete the security check above, then try again.',
        TURNSTILE_FAILED: 'The security check did not succeed. Please try again.',
        SESSION_EXPIRED: 'This session has expired. Start a new object.',
        SESSION_INVALID: 'This session can no longer be used. Start a new object.',
        REVISION_LIMIT: 'This description cannot be adjusted any more. Start a new object if needed.',
        PROVIDER_BUSY: 'The writing service is busy. Please try again in a minute.',
        PROVIDER_TIMEOUT: 'The writing service took too long. Please try again.',
        CONTENT_MISSING_STYLE_BRAND: 'The text did not keep your “style” wording. Please try again.',
        CONTENT_NO_DESCRIPTIVE_FACTS: 'Nothing could be read from these photos. Add clearer photos or notes.',
        INVALID_IMAGE: 'One of the photos could not be used. Try another photo.',
        PHOTO_TOO_LARGE: 'One of the photos is too large even after resizing.',
        REQUEST_TOO_LARGE: 'The photos are too large together. Use fewer photos.',
        ORIGIN_NOT_ALLOWED: 'The studio cannot be used from this address.',
        OWNER_ONLY: 'The studio is reserved for the site owner. Enter the owner key to continue.',
        CONTENT_SEO_REJECTED: 'The archive page text did not pass the checks. Try again or adjust the description.',
        ARCHIVE_UNAVAILABLE: 'The archive is not available yet.',
        STORAGE_FAILED: 'The photos could not be stored. Please try again.',
        LISTING_UNAVAILABLE: 'The studio is temporarily unavailable. Please try again later.',
        network: 'The studio could not be reached. Check your connection and try again.',
        generic: 'Something went wrong. Please try again.'
      }
    },
    fr: {
      tooManyPhotos: 'Vous pouvez ajouter jusqu’à 10 photos.',
      noPhotos: 'Ajoutez au moins une photo.',
      photoUnreadable: 'Cette photo n’a pas pu être lue. Utilisez une photo JPEG, PNG ou WebP.',
      preparing: 'Préparation de vos photos…',
      writing: 'Lecture des photos et rédaction de la description. Cela peut prendre jusqu’à une minute…',
      revising: 'Mise à jour de la description…',
      done: 'Description prête.',
      revised: 'Description mise à jour.',
      copied: 'Texte copié.',
      copyFailed: 'La copie n’a pas fonctionné ; sélectionnez le texte et copiez-le manuellement.',
      remaining: function (n) { return n <= 1 ? n + ' ajustement restant pour cet objet.' : n + ' ajustements restants pour cet objet.'; },
      removePhoto: 'Retirer la photo',
      none: 'Rien à signaler.',
      ownerActive: 'Accès propriétaire actif dans ce navigateur.',
      ownerInactive: 'Accès propriétaire non configuré.',
      ownerSaved: 'Clé propriétaire enregistrée.',
      ownerRemoved: 'Clé propriétaire supprimée.',
      ownerRequired: 'Ce studio est réservé au propriétaire du site. Saisissez la clé propriétaire pour l’utiliser.',
      savingArchive: 'Préparation des photos et enregistrement dans les archives…',
      savedArchive: 'Enregistré dans les archives. La page apparaîtra sur le site dès que la publication sera activée.',
      saveNeedsPhotos: 'Les photos ne sont plus dans cette page. Recommencez un nouvel objet avec les mêmes photos pour l’enregistrer dans les archives.',
      errors: {
        VISITOR_DAILY_LIMIT: 'Vous avez atteint la limite du jour. Revenez demain.',
        IP_DAILY_LIMIT: 'La limite du jour est atteinte pour cette connexion. Revenez demain.',
        DAILY_BUDGET_REACHED: 'Le studio est très sollicité aujourd’hui. Revenez demain.',
        ADMIN_DAILY_CAP_REACHED: 'La limite de sécurité quotidienne du propriétaire est atteinte.',
        ADMIN_KEY_INVALID: 'La clé propriétaire n’est pas valide. Supprimez-la ou saisissez-la à nouveau.',
        TURNSTILE_REQUIRED: 'Veuillez compléter la vérification de sécurité ci-dessus, puis réessayer.',
        TURNSTILE_FAILED: 'La vérification de sécurité a échoué. Veuillez réessayer.',
        SESSION_EXPIRED: 'Cette session a expiré. Commencez un nouvel objet.',
        SESSION_INVALID: 'Cette session ne peut plus être utilisée. Commencez un nouvel objet.',
        REVISION_LIMIT: 'Cette description ne peut plus être ajustée. Commencez un nouvel objet si besoin.',
        PROVIDER_BUSY: 'Le service de rédaction est occupé. Réessayez dans une minute.',
        PROVIDER_TIMEOUT: 'Le service de rédaction a mis trop de temps. Veuillez réessayer.',
        CONTENT_MISSING_STYLE_BRAND: 'Le texte n’a pas conservé votre mention « style ». Veuillez réessayer.',
        CONTENT_NO_DESCRIPTIVE_FACTS: 'Rien n’a pu être lu sur ces photos. Ajoutez des photos plus nettes ou des notes.',
        INVALID_IMAGE: 'Une des photos n’a pas pu être utilisée. Essayez une autre photo.',
        PHOTO_TOO_LARGE: 'Une des photos est trop lourde, même redimensionnée.',
        REQUEST_TOO_LARGE: 'Les photos sont trop lourdes ensemble. Utilisez moins de photos.',
        ORIGIN_NOT_ALLOWED: 'Le studio ne peut pas être utilisé depuis cette adresse.',
        OWNER_ONLY: 'Le studio est réservé au propriétaire du site. Saisissez la clé propriétaire pour continuer.',
        CONTENT_SEO_REJECTED: 'Le texte de la page d’archive n’a pas passé les contrôles. Réessayez ou ajustez la description.',
        ARCHIVE_UNAVAILABLE: 'Les archives ne sont pas encore disponibles.',
        STORAGE_FAILED: 'Les photos n’ont pas pu être enregistrées. Veuillez réessayer.',
        LISTING_UNAVAILABLE: 'Le studio est momentanément indisponible. Réessayez plus tard.',
        network: 'Le studio est injoignable. Vérifiez votre connexion et réessayez.',
        generic: 'Une erreur est survenue. Veuillez réessayer.'
      }
    }
  };
  var T = STRINGS[LANG];

  var MAX_PHOTOS = 10;
  var MAX_PHOTO_BYTES = 1024 * 1024;
  // Largest edge and JPEG quality, tried in order until a photo fits the upload limit.
  var ATTEMPTS = [[2560, 0.88], [2560, 0.8], [2048, 0.8], [1600, 0.75], [1280, 0.7]];
  // Archive photos (saved to the website's photo store): a page size and a thumbnail size.
  var ARCHIVE_LARGE = { bytes: 700 * 1024, attempts: [[1600, 0.85], [1600, 0.78], [1400, 0.75], [1200, 0.72]] };
  var ARCHIVE_SMALL = { bytes: 200 * 1024, attempts: [[800, 0.8], [800, 0.7], [640, 0.7]] };
  var KEYS = { session: 'studio-session', visitor: 'studio-visitor', admin: 'studio-admin-key' };

  var $ = function (id) { return document.getElementById(id); };
  // The default hint is the page's own (translated) text; it is replaced when the photos are gone.
  var STUDIO_SAVE_HINT = '';
  var photos = []; // { file, url }
  var state = null; // { session, title, description, history: [], remaining, uncertain: [], condition: [] }
  var turnstileWidget = null;

  /* ── API address: set at build time; a local override is allowed only on a local development host. ── */
  function apiBase() {
    var base = document.body.getAttribute('data-api') || '';
    var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    var override = new URLSearchParams(location.search).get('api');
    if (local && override && /^https?:\/\/[^\s]+$/.test(override)) base = override;
    return base.replace(/\/+$/, '');
  }

  function storage(kind) {
    try { return kind === 'session' ? window.sessionStorage : window.localStorage; } catch (e) { return null; }
  }
  function load(key, kind) { var s = storage(kind); try { return s ? s.getItem(key) : null; } catch (e) { return null; } }
  function save(key, value, kind) {
    var s = storage(kind); if (!s) return;
    try { if (value === null) s.removeItem(key); else s.setItem(key, value); } catch (e) { /* storage full or blocked */ }
  }

  function setStatus(text, isError) {
    var el = $('studio-status');
    el.textContent = text || '';
    el.classList.toggle('studio-status-error', !!isError);
  }

  function busy(on) {
    ['studio-generate', 'studio-send', 'studio-chat-input', 'studio-photos', 'studio-save'].forEach(function (id) {
      var el = $(id); if (el) el.disabled = on;
    });
    document.body.classList.toggle('studio-busy', on);
  }

  /* ── Photos ── */
  function renderThumbs() {
    var list = $('studio-thumbs');
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
    if (photos.length + files.length > MAX_PHOTOS) setStatus(T.tooManyPhotos, true);
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

  // Orientation is applied, the photo is drawn on a white background and re-encoded as JPEG: this also removes
  // EXIF/GPS metadata. The server strips metadata again and never trusts the browser alone.
  async function preparePhoto(file, attempts, maxBytes) {
    attempts = attempts || ATTEMPTS;
    maxBytes = maxBytes || MAX_PHOTO_BYTES;
    var bitmap;
    try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { throw new Error('photoUnreadable'); }
    var canvas = document.createElement('canvas');
    try {
      for (var i = 0; i < attempts.length; i++) {
        var scale = Math.min(1, attempts[i][0] / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        var blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', attempts[i][1]); });
        if (blob && blob.size <= maxBytes) return { media_type: 'image/jpeg', data: await blobToBase64(blob) };
      }
    } finally {
      if (bitmap.close) bitmap.close();
    }
    throw new Error('PHOTO_TOO_LARGE');
  }

  /* ── API ── */
  async function call(path, body) {
    var headers = { 'Content-Type': 'application/json' };
    var admin = load(KEYS.admin, 'local');
    if (admin) headers.Authorization = 'Bearer ' + admin;
    var response;
    try {
      response = await fetch(apiBase() + path, { method: 'POST', headers: headers, body: JSON.stringify(body) });
    } catch (e) {
      throw new Error('network');
    }
    var result = null;
    try { result = await response.json(); } catch (e) { /* not JSON */ }
    if (!response.ok) throw new Error((result && result.error && result.error.code) || 'generic');
    return result;
  }

  function errorText(error) {
    var code = error && error.message;
    if (code === 'photoUnreadable') return T.photoUnreadable;
    return T.errors[code] || T.errors.generic;
  }

  /* ── Result and chat ── */
  function fillList(id, items) {
    var list = $(id);
    list.textContent = '';
    (items && items.length ? items : [T.none]).forEach(function (text) {
      var li = document.createElement('li'); li.textContent = text; list.appendChild(li);
    });
  }

  function hasOwnerKey() {
    return !!load(KEYS.admin, 'local');
  }

  function render() {
    // Owner-only studio: without a saved owner key, show neither the form nor a result; the owner panel below
    // prompts for the key instead.
    if (!hasOwnerKey()) {
      $('studio-form').hidden = true;
      $('studio-result').hidden = true;
      return;
    }
    var hasResult = !!state;
    $('studio-result').hidden = !hasResult;
    $('studio-form').hidden = hasResult;
    if (!hasResult) return;
    $('studio-listing-title').textContent = state.title;
    var text = $('studio-listing-text');
    text.textContent = '';
    state.description.split(/\n\s*\n/).forEach(function (paragraph) {
      if (!paragraph.trim()) return;
      var p = document.createElement('p'); p.textContent = paragraph.trim(); text.appendChild(p);
    });
    fillList('studio-uncertain', state.uncertain);
    fillList('studio-condition', state.condition);
    var log = $('studio-chat-log');
    log.textContent = '';
    state.history.forEach(function (request) {
      var li = document.createElement('li'); li.textContent = request; log.appendChild(li);
    });
    $('studio-remaining').textContent = T.remaining(state.remaining);
    var canAdjust = state.remaining > 0;
    $('studio-chat-input').disabled = !canAdjust;
    $('studio-send').disabled = !canAdjust;
    // Saving needs the photo files, which only exist in memory until the page is reloaded.
    $('studio-save').disabled = !photos.length;
    $('studio-save-hint').textContent = photos.length ? STUDIO_SAVE_HINT : T.saveNeedsPhotos;
  }

  function apply(result, request) {
    state = {
      session: result.session,
      title: result.listing.title,
      description: result.listing.description,
      uncertain: result.listing.uncertain_details || [],
      condition: result.listing.condition_observations || [],
      history: request ? state.history.concat([request]) : [],
      remaining: result.revisions_remaining
    };
    if (result.visitor) save(KEYS.visitor, result.visitor, 'local');
    save(KEYS.session, JSON.stringify(state), 'session');
    render();
  }

  /* ── Bot check: only when the site has a Turnstile site key, and not needed for the owner. ── */
  function setupTurnstile() {
    var siteKey = document.body.getAttribute('data-turnstile-sitekey');
    if (!siteKey) return;
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = function () {
      if (!window.turnstile) return;
      turnstileWidget = window.turnstile.render('#studio-turnstile', { sitekey: siteKey, language: LANG });
    };
    document.head.appendChild(script);
  }
  function turnstileToken() {
    return turnstileWidget !== null && window.turnstile ? window.turnstile.getResponse(turnstileWidget) || undefined : undefined;
  }
  function resetTurnstile() {
    if (turnstileWidget !== null && window.turnstile) window.turnstile.reset(turnstileWidget);
  }

  async function generate(event) {
    event.preventDefault();
    if (!photos.length) { setStatus(T.noPhotos, true); return; }
    busy(true);
    try {
      setStatus(T.preparing);
      var prepared = [];
      for (var i = 0; i < photos.length; i++) prepared.push(await preparePhoto(photos[i].file));
      setStatus(T.writing);
      var body = {
        notes: $('studio-notes').value.trim(),
        language: $('studio-language').value,
        photos: prepared
      };
      var token = turnstileToken();
      if (token) body.turnstile_token = token;
      var visitor = load(KEYS.visitor, 'local');
      if (visitor) body.visitor = visitor;
      apply(await call('/listing', body), null);
      setStatus(T.done);
    } catch (error) {
      setStatus(errorText(error), true);
    } finally {
      resetTurnstile();
      busy(false);
      if (state) render();
    }
  }

  async function revise(event) {
    event.preventDefault();
    var input = $('studio-chat-input');
    var request = input.value.trim();
    if (!request || !state) return;
    busy(true);
    setStatus(T.revising);
    try {
      apply(await call('/listing/revise', { session: state.session, request: request }), request);
      input.value = '';
      setStatus(T.revised);
    } catch (error) {
      setStatus(errorText(error), true);
    } finally {
      busy(false);
      render();
      input.focus();
    }
  }

  async function saveToArchive() {
    if (!state || !photos.length) { setStatus(T.saveNeedsPhotos, true); return; }
    busy(true);
    setStatus(T.savingArchive);
    try {
      var prepared = [];
      for (var i = 0; i < photos.length; i++) {
        prepared.push({
          large: await preparePhoto(photos[i].file, ARCHIVE_LARGE.attempts, ARCHIVE_LARGE.bytes),
          small: await preparePhoto(photos[i].file, ARCHIVE_SMALL.attempts, ARCHIVE_SMALL.bytes)
        });
      }
      await call('/listing/save', { session: state.session, photos: prepared });
      setStatus(T.savedArchive);
    } catch (error) {
      setStatus(errorText(error), true);
    } finally {
      busy(false);
      render();
    }
  }

  async function copy() {
    var text = state.title + '\n\n' + state.description;
    try {
      await navigator.clipboard.writeText(text);
      setStatus(T.copied);
    } catch (e) {
      setStatus(T.copyFailed, true);
    }
  }

  function reset() {
    state = null;
    save(KEYS.session, null, 'session');
    photos.forEach(function (photo) { URL.revokeObjectURL(photo.url); });
    photos = [];
    $('studio-photos').value = '';
    $('studio-notes').value = '';
    renderThumbs();
    setStatus('');
    render();
  }

  /* ── Owner key ── */
  // Owner-only studio: the form is shown only when this browser holds a saved owner key. Without a key the owner
  // panel is always visible (and opened) so the owner can enter it; visitors simply cannot use the studio.
  function renderOwner() {
    var active = hasOwnerKey();
    $('studio-owner-status').textContent = active ? T.ownerActive : T.ownerInactive;
    document.body.classList.toggle('studio-owner-active', active);
    var owner = $('studio-owner');
    owner.hidden = false;
    owner.open = !active;
    if (!active) setStatus(T.ownerRequired);
  }

  function init() {
    if (!apiBase()) {
      $('studio-unavailable').hidden = false;
      $('studio-form').hidden = true;
      $('studio-owner').hidden = true;
      return;
    }
    $('studio-language').value = LANG;
    STUDIO_SAVE_HINT = $('studio-save-hint').textContent;
    $('studio-photos').addEventListener('change', function (event) {
      setStatus('');
      addFiles(event.target.files);
      event.target.value = '';
    });
    $('studio-form').addEventListener('submit', generate);
    $('studio-chat-form').addEventListener('submit', revise);
    $('studio-copy').addEventListener('click', copy);
    $('studio-save').addEventListener('click', saveToArchive);
    $('studio-new').addEventListener('click', reset);
    $('studio-owner-save').addEventListener('click', function () {
      var key = $('studio-owner-key').value.trim();
      if (!key) return;
      save(KEYS.admin, key, 'local');
      $('studio-owner-key').value = '';
      renderOwner();
      render();
      setStatus(T.ownerSaved);
    });
    $('studio-owner-remove').addEventListener('click', function () {
      save(KEYS.admin, null, 'local');
      reset();
      renderOwner();
    });
    renderOwner();
    setupTurnstile();
    // Restore the current object after a page reload in the same tab.
    var saved = load(KEYS.session, 'session');
    if (saved) {
      try { state = JSON.parse(saved); } catch (e) { state = null; }
    }
    render();
  }

  init();
})();
