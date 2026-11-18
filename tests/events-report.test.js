// Owner conversion report (scripts/events-report.js): aggregation only, no network.
const assert = require('node:assert/strict');
const test = require('node:test');
const {summarize, render} = require('../scripts/events-report.js');

const row = (event, item_id, count, extra = {}) => ({
  day: '2026-11-17', event, item_id, list: '', lang: 'en', source: 'google',
  utm_source: '', utm_medium: '', utm_campaign: '', count, ...extra
});

test('the report totals views, enquiries and offers and ranks products by real buying interest', () => {
  const summary = summarize([
    row('view_item', 'cocotte', 10),
    row('view_item', 'mama-dish', 4, {list: 'curated', source: 'internal'}),
    row('begin_make_offer', 'mama-dish', 2, {list: 'product'}),
    row('submit_make_offer', 'mama-dish', 1, {list: 'product'}),
    row('begin_purchase_enquiry', 'cocotte', 1, {list: 'product'}),
    row('select_item', 'cocotte', 3, {list: 'guide:le-creuset-dating-guide', source: 'google'}),
    row('view_item', 'cocotte', 2, {source: 'pinterest', utm_source: 'pinterest', utm_medium: 'social', utm_campaign: 'autumn'})
  ]);
  assert.deepEqual(summary.totals, {key: 'all', views: 16, selects: 3, beginPurchase: 1, purchases: 0, beginOffer: 2, offers: 1});
  assert.equal(summary.items[0].key, 'mama-dish', 'a sent offer outranks views alone');
  assert.deepEqual(summary.origins.map(o => o.key).sort(),
    ['curated', 'google', 'guide:le-creuset-dating-guide', 'pinterest (pinterest)'].sort());
  assert.equal(summary.campaigns[0].key, 'pinterest / social / autumn');
  assert.deepEqual(summary.sources.map(r => [r.key, r.offers, r.beginPurchase]), [['google', 1, 1]]);
  const text = render(summary, {since: '2026-11-01', days: 30});
  assert.match(text, /Offers: 1 sent \/ 2 started/);
  assert.match(text, /mama-dish/);
});

test('an empty period renders without dividing by zero', () => {
  const text = render(summarize([]), {since: '2026-11-18', days: 1});
  assert.match(text, /Conversion \(sent enquiries \+ offers per product view\): —/);
  assert.match(text, /\(none\)/);
});
