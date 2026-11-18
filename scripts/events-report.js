#!/usr/bin/env node
/* Owner report of the first-party conversion events (js/track.js).
 *
 * Reads the aggregated daily counts from the identify-agent Worker
 * (GET <api>/events/summary, owner-only) and prints product interest,
 * enquiries, offers and where they came from. The counts contain no personal
 * data: no names, emails, messages, amounts or visitor identifiers.
 *
 *   EVENTS_ADMIN_KEY=<LISTING_ADMIN_KEY> npm run report:events -- --days 30
 *
 * Options: --days N (1-400, default 30), --api <url> (default
 * https://api.cookandcollect.eu), --json (machine-readable output).
 * The admin key is read from the environment only, never from the command line. */
'use strict';

const VIEW = 'view_item';
const SELECT = 'select_item';
const BEGIN_PURCHASE = 'begin_purchase_enquiry';
const SUBMIT_PURCHASE = 'submit_purchase_enquiry';
const BEGIN_OFFER = 'begin_make_offer';
const SUBMIT_OFFER = 'submit_make_offer';

function bump(map, key, event, count) {
  if (!map.has(key)) map.set(key, {key, views: 0, selects: 0, beginPurchase: 0, purchases: 0, beginOffer: 0, offers: 0});
  const row = map.get(key);
  if (event === VIEW) row.views += count;
  else if (event === SELECT) row.selects += count;
  else if (event === BEGIN_PURCHASE) row.beginPurchase += count;
  else if (event === SUBMIT_PURCHASE) row.purchases += count;
  else if (event === BEGIN_OFFER) row.beginOffer += count;
  else if (event === SUBMIT_OFFER) row.offers += count;
}

// Share of product views that ended in a sent enquiry or offer; null without views.
const conversion = row => (row.views ? (row.purchases + row.offers) / row.views : null);

// Where a product view came from: the list for internal journeys (guide, category,
// curated selection…), otherwise the external source (google, pinterest, direct…).
function viewOrigin(row) {
  if (row.list && !['product', 'internal', 'related'].includes(row.list)) return row.list;
  return row.utm_source ? `${row.source || 'other'} (${row.utm_source})` : (row.source || 'unknown');
}

/** Aggregates the summary rows into per-product, per-origin and per-campaign tables. */
function summarize(rows) {
  const byItem = new Map();
  const byOrigin = new Map();
  const bySource = new Map();
  const byCampaign = new Map();
  const totals = {key: 'all', views: 0, selects: 0, beginPurchase: 0, purchases: 0, beginOffer: 0, offers: 0};
  for (const row of rows) {
    const count = Number(row.count) || 0;
    bump(new Map([['all', totals]]), 'all', row.event, count);
    if (row.item_id) bump(byItem, row.item_id, row.event, count);
    if (row.event === VIEW || row.event === SELECT) bump(byOrigin, viewOrigin(row), row.event, count);
    // Enquiries and offers carry the visit's landing source (google, pinterest, direct…).
    else bump(bySource, row.utm_source ? `${row.source || 'other'} (${row.utm_source})` : (row.source || 'unknown'), row.event, count);
    if (row.utm_campaign) bump(byCampaign, `${row.utm_source || '?'} / ${row.utm_medium || '?'} / ${row.utm_campaign}`, row.event, count);
  }
  const interest = r => r.purchases * 100 + r.offers * 100 + r.beginPurchase * 10 + r.beginOffer * 10 + r.views;
  const sorted = map => [...map.values()].sort((a, b) => interest(b) - interest(a) || a.key.localeCompare(b.key));
  return {totals, items: sorted(byItem), origins: sorted(byOrigin), sources: sorted(bySource), campaigns: sorted(byCampaign)};
}

function percent(value) {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`;
}

function table(title, rows, label) {
  const lines = [`\n${title}`];
  if (!rows.length) return [...lines, '  (none)'].join('\n');
  const width = Math.min(60, Math.max(label.length, ...rows.map(r => r.key.length)));
  lines.push(`  ${label.padEnd(width)}  views  enquiries  offers  conversion`);
  for (const r of rows) {
    lines.push(`  ${r.key.slice(0, width).padEnd(width)}  ${String(r.views).padStart(5)}  ${`${r.purchases}/${r.beginPurchase}`.padStart(9)}  ${`${r.offers}/${r.beginOffer}`.padStart(6)}  ${percent(conversion(r)).padStart(10)}`);
  }
  return lines.join('\n');
}

function viewsTable(title, rows) {
  const lines = [`\n${title}`];
  if (!rows.length) return [...lines, '  (none)'].join('\n');
  const width = Math.min(60, Math.max(6, ...rows.map(r => r.key.length)));
  lines.push(`  ${'origin'.padEnd(width)}  views  clicks`);
  for (const r of rows) lines.push(`  ${r.key.slice(0, width).padEnd(width)}  ${String(r.views).padStart(5)}  ${String(r.selects).padStart(6)}`);
  return lines.join('\n');
}

function render(summary, meta) {
  const t = summary.totals;
  return [
    `Cook & Collect — conversion events since ${meta.since} (${meta.days} day(s), UTC)`,
    `  Product views: ${t.views} · product clicks from lists: ${t.selects}`,
    `  Purchase enquiries: ${t.purchases} sent / ${t.beginPurchase} started`,
    `  Offers: ${t.offers} sent / ${t.beginOffer} started`,
    `  Conversion (sent enquiries + offers per product view): ${percent(conversion(t))}`,
    table('Products by interest (enquiries and offers shown as sent/started)', summary.items, 'product'),
    viewsTable('Where product views and list clicks came from', summary.origins),
    table('Enquiries and offers by visit source (sent/started)', summary.sources, 'source'),
    table('UTM campaigns', summary.campaigns, 'source / medium / campaign'),
    '\nCounts are daily aggregates; a reload or a reopened form counts again. Small numbers are not trends.'
  ].join('\n');
}

function parseArgs(argv) {
  const args = {days: 30, api: 'https://api.cookandcollect.eu', json: false};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--days') args.days = Number(argv[++i]);
    else if (argv[i] === '--api') args.api = String(argv[++i] || '').replace(/\/+$/, '');
    else if (argv[i] === '--json') args.json = true;
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  if (!Number.isInteger(args.days) || args.days < 1 || args.days > 400) throw new Error('--days must be an integer from 1 to 400');
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = process.env.EVENTS_ADMIN_KEY;
  if (!key) throw new Error('Set EVENTS_ADMIN_KEY to the owner admin key (LISTING_ADMIN_KEY).');
  const response = await fetch(`${args.api}/events/summary?days=${args.days}`, {headers: {Authorization: `Bearer ${key}`}});
  if (response.status === 403) throw new Error('The API refused the key (403 OWNER_ONLY).');
  if (!response.ok) throw new Error(`The API answered ${response.status}.`);
  const data = await response.json();
  const summary = summarize(data.rows || []);
  if (data.rows && data.rows.length >= 5000) console.warn('Warning: the API returned its 5000-row maximum; use fewer --days.');
  console.log(args.json ? JSON.stringify({since: data.since, days: data.days, ...summary}, null, 2)
    : render(summary, {since: data.since, days: data.days}));
}

module.exports = {summarize, render, conversion, viewOrigin};

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}
