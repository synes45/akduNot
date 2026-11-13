import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEMS, getW, setUnitPref } from '../src/config.js';
import { itemScore, compute, wText } from '../src/calc.js';

globalThis.window = { dispatchEvent() {} }; // setUnitPref notifies the UI

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('D2 weights are credits and sum to 60', () => {
  for (const k of ['d2_normal', 'd2_repeat']) {
    close(SYSTEMS[k].items.reduce((a, i) => a + getW(k, i), 0), 60);
  }
  close(getW('d2_normal', SYSTEMS.d2_normal.items[0]), 14);
  const [mk, ed] = SYSTEMS.d2_normal.items.slice(-2);
  assert.deepEqual([mk.id, getW('d2_normal', mk), ed.id, getW('d2_normal', ed)], ['makale', 1, 'edebiyat', 2]);
  assert.equal(mk.group, ed.group); // shown in one card, scored separately
  assert.equal(wText('d2_normal', 14), '14 kredi');
  setUnitPref('pct'); // display only: same stored value, same calculation
  assert.equal(wText('d2_normal', 15), '%25');
  assert.equal(getW('d2_normal', SYSTEMS.d2_normal.items[0]), 14);
  setUnitPref('credit');
});

test('D2 in-year: one item at 60 and the rest 0 gives credit share', () => {
  // only k1 (14 credits) scores 100 -> in-year part 14/60 * 100
  const s = { k1: '100', k1_anatomi: '13', k1_histo: '100', k1_pdo: '100', final: '0' };
  for (const i of SYSTEMS.d2_normal.items.slice(1)) {
    s[i.id] = '0';
    if (i.prac) { s[`${i.id}_anatomi`] = '0'; s[`${i.id}_histo`] = '0'; s[`${i.id}_pdo`] = '0'; }
  }
  close(compute('d2_normal', s).genel, (14 / 60) * 100 * 0.6);
});

test('D2 committee: 84% theory + anatomy(13) + histology(100 -> 3), then 85/15 with PDO', () => {
  const k1 = SYSTEMS.d2_normal.items[0];
  close(itemScore(k1, { k1: '100', k1_anatomi: '13', k1_histo: '100', k1_pdo: '100' }, 'd2_normal'), 100);
  // theory 50 -> 42, anatomy 6.5, histology 50 -> 1.5: exam 50; PDO 70
  close(itemScore(k1, { k1: '50', k1_anatomi: '6.5', k1_histo: '50', k1_pdo: '70' }, 'd2_normal'), 50 * 0.85 + 70 * 0.15);
});

test('D2 in-year total and needed final', () => {
  const s = { final: '' };
  for (const i of SYSTEMS.d2_normal.items) {
    s[i.id] = '100';
    if (i.prac) { s[`${i.id}_anatomi`] = '13'; s[`${i.id}_histo`] = '100'; s[`${i.id}_pdo`] = '100'; }
  }
  s.final = '100';
  const r = compute('d2_normal', s);
  assert.equal(r.ready, true);
  close(r.genel, 100);
});
