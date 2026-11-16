/* Cook & Collect — first-party, cookieless conversion events.
 *
 * Sends anonymous product-interest events (view_item, select_item, enquiry and
 * offer steps) to the identify-agent Worker (POST <data-api>/events), which only
 * keeps daily aggregate counts. Nothing is stored in cookies; the landing
 * source of the visit is kept in sessionStorage for the length of the tab
 * session. Names, emails, messages and amounts are never part of an event.
 *
 * Disabled (no network request) while the build sets no ANALYTICS_API_BASE, and
 * when the browser sends Global Privacy Control. Events are always pushed to
 * window.dataLayer so tests and a future analytics tool can observe them. */
(function () {
  'use strict';

  var script = document.currentScript;
  var API = ((script && script.getAttribute('data-api')) || '').replace(/\/+$/, '');
  var LANG = document.documentElement.lang === 'fr' ? 'fr' : 'en';
  var ATTR_KEY = 'cc_attribution';
  var SELECT_KEY = 'cc_last_select';
  var EVENTS = ['view_item', 'select_item', 'begin_purchase_enquiry', 'submit_purchase_enquiry', 'begin_make_offer', 'submit_make_offer'];

  function storage() {
    try { return window.sessionStorage; } catch (e) { return null; }
  }
  function readJson(key) {
    var s = storage();
    if (!s) return null;
    try { return JSON.parse(s.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function writeJson(key, value) {
    var s = storage();
    if (!s) return;
    try { s.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
  }
  function clip(value) {
    return typeof value === 'string' && value ? value.slice(0, 100) : undefined;
  }

  function classifyHost(host) {
    host = (host || '').toLowerCase();
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return 'google';
    if (/(^|\.)bing\.com$/.test(host)) return 'bing';
    if (/(^|\.)pinterest\.[a-z.]+$/.test(host) || host === 'pin.it') return 'pinterest';
    if (/(^|\.)(facebook\.com|instagram\.com|messenger\.com|whatsapp\.com|t\.co|twitter\.com|x\.com|reddit\.com|linkedin\.com)$/.test(host)) return 'social';
    return 'referral';
  }
  function classifyUtm(source) {
    source = (source || '').toLowerCase();
    if (/google/.test(source)) return 'google';
    if (/bing/.test(source)) return 'bing';
    if (/pinterest/.test(source)) return 'pinterest';
    if (/facebook|instagram|whatsapp|messenger|twitter|reddit|linkedin/.test(source)) return 'social';
    return 'other';
  }

  // Where this visit came from: decided when the visitor arrives from outside
  // (campaign link or external referrer) and kept while they browse the site.
  function landingAttribution() {
    var stored = readJson(ATTR_KEY);
    var params = new URLSearchParams(window.location.search);
    var external = false;
    try { external = Boolean(document.referrer) && new URL(document.referrer).host !== window.location.host; } catch (e) { external = false; }
    if (stored && stored.source && !params.get('utm_source') && !external) return stored;
    var attribution = {
      utm_source: clip(params.get('utm_source')),
      utm_medium: clip(params.get('utm_medium')),
      utm_campaign: clip(params.get('utm_campaign'))
    };
    var ref = null;
    try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) { ref = null; }
    if (attribution.utm_source) attribution.source = classifyUtm(attribution.utm_source);
    else if (ref && ref.host !== window.location.host) attribution.source = classifyHost(ref.hostname);
    else attribution.source = 'direct';
    writeJson(ATTR_KEY, attribution);
    return attribution;
  }

  // The list a same-site referrer page represents (guide, collection page…).
  function listFromPath(pathname) {
    var m = pathname.match(/\/guides\/([a-z0-9-]+)\.html$/);
    if (m) return 'guide:' + m[1];
    if (/\/guides\/(index\.html)?$/.test(pathname)) return 'guide:index';
    m = pathname.match(/\/shop\/([a-z0-9-]+)\.html$/);
    if (m) return 'category:' + m[1];
    if (/\/sold\.html$/.test(pathname)) return 'sold';
    if (/\/collection\//.test(pathname)) return 'related';
    if (/^\/((en|fr)\/)?(index\.html)?$/.test(pathname)) return 'home';
    return 'internal';
  }
  function sourceFromList(list) {
    if (/^guide:/.test(list)) return 'guide';
    if (/^category:/.test(list)) return 'category';
    return 'internal';
  }

  var attribution = landingAttribution();

  function send(eventName, data) {
    if (EVENTS.indexOf(eventName) === -1) return;
    data = data || {};
    var payload = {
      event: eventName,
      item_id: data.item_id,
      list: data.list || undefined,
      lang: LANG,
      source: data.source || attribution.source,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (!API || navigator.globalPrivacyControl === true) return;
    var body = JSON.stringify(payload);
    try {
      // text/plain keeps this a CORS "simple" request (no preflight).
      if (navigator.sendBeacon && navigator.sendBeacon(API + '/events', new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) { /* fall through to fetch */ }
    try {
      fetch(API + '/events', { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, credentials: 'omit', mode: 'cors' }).catch(function () {});
    } catch (e) { /* analytics must never break the page */ }
  }

  // Context shared with js/enquiry.js (attribution travels with an enquiry).
  window.ccAttribution = function () {
    return {
      source: attribution.source,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign
    };
  };
  window.ccTrack = send;

  // select_item: a click on any product card inside a named list.
  document.addEventListener('click', function (event) {
    var card = event.target && event.target.closest ? event.target.closest('a.item-card[data-item-id]') : null;
    if (!card) return;
    var container = card.closest('[data-list]');
    var list = container ? container.getAttribute('data-list') : listFromPath(window.location.pathname);
    var itemId = card.getAttribute('data-item-id');
    writeJson(SELECT_KEY, { item_id: itemId, list: list });
    send('select_item', { item_id: itemId, list: list, source: attribution.source });
  }, true);

  // view_item: once per product page load. The source says how the visitor
  // reached this product: from a guide, a collection page, elsewhere on the
  // site, or straight from outside (Google, Pinterest…).
  var body = document.body;
  if (body && body.getAttribute('data-page') === 'collection-item') {
    var itemId = body.getAttribute('data-item-id');
    var selected = readJson(SELECT_KEY);
    var list;
    var source;
    var ref = null;
    try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) { ref = null; }
    if (selected && selected.item_id === itemId) {
      list = selected.list;
      source = sourceFromList(list);
    } else if (ref && ref.host === window.location.host) {
      list = listFromPath(ref.pathname);
      source = sourceFromList(list);
    } else {
      source = ref && !attribution.utm_source ? classifyHost(ref.hostname) : attribution.source;
    }
    var s = storage();
    if (s) { try { s.removeItem(SELECT_KEY); } catch (e) { /* ignore */ } }
    send('view_item', { item_id: itemId, list: list, source: source });
  }
})();
